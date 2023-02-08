import { WebSocket } from 'ws'
import { Db } from 'mongodb'
import { debug } from 'debug'
import { randomUUID } from 'crypto'
import * as poisson from 'poisson-process'
import { throttle } from 'underscore'
import type { Request, Response } from 'express'

import { dispatch } from '~/handlers'
import { Context } from '~/context'
import { ServerMessage } from '~/protocol'
import { ManagerEvent, RoundData, RoundStatus } from '~/round'
import { Game, GameMap, Player } from '~/game'
import { generateObject } from '~/game_objects'
import { handleLogin } from '~/handle_login'
import * as config from '~/config'
import parser from '~/parser'

const log = debug('server:manager')

export const roundMessage = {
	[RoundStatus.PREINIT]: 'not initialized',
	[RoundStatus.INIT]: 'not started',
	[RoundStatus.RUNNING]: 'running',
	[RoundStatus.END]: 'ended',
}

export class Manager {
	public contexts: Map<string, Context>
	public game: Game
	public generator: poisson.PoissonInstance

	constructor(
		public db: Db,
		public round: RoundData = {
			number: 1,
			status: RoundStatus.PREINIT,
		},
	) {
		this.contexts = new Map<string, Context>()
		this.game = new Game(new GameMap(config.MAP_SIZE, config.MAP_SIZE))

		eventQueue.on('event', event => {
			for (const ctx of this.contexts.values()) {
				ctx.send(event)
			}
		})

		eventQueue.on('manage', this.handleEvent.bind(this))

		this.generator = poisson.create(config.GEN_DURATION, () => {
			const object = generateObject()
			this.game.addObject(object)
			eventQueue.push({
				type: 'new_object_spawned',
				data: { object },
			})
		})
	}

	handleEvent(event: ManagerEvent) {
		log('handle event %s', event)
		switch (event) {
			case 'round_init':
				this.roundInitImpl()
				break
			case 'round_start':
				this.roundStartImpl()
				break
			case 'round_end':
				this.roundEndImpl()
				break
			case 'round_tick':
				this.roundTick()
				break
			case 'check_death':
				this.checkDeath()
				break
		}
	}

	async handleConnection(ws: WebSocket) {
		try {
			const sessionId = randomUUID()
			log('%s connected', sessionId)
			const player = await handleLogin(ws, this.db)
			this.game.addPlayer(player)
			eventQueue.push({
				type: 'join',
				data: { player },
			})
			log('%s logined', sessionId)
			const ctx = new Context(sessionId, ws, this.game, player, this.db)
			ctx.init(this.round)
			this.contexts.set(sessionId, ctx)
			ws.on('message', rawData => {
				try {
					const msg: ServerMessage = parser.parse(rawData.toString())
					log('%s received %o', sessionId, msg)
					if (this.round.status === RoundStatus.RUNNING) {
						dispatch(ctx, msg)
					} else {
						ctx.send({
							type: 'error',
							data: `Round ${this.round.number} ${
								roundMessage[this.round.status]
							}`,
						})
					}
				} catch (e) {
					log('error: %s', e)
					ws.close()
				}
			})
			ws.on('close', () => {
				log('%s disconnected', sessionId)
				this.game.removePlayer(player)
				this.contexts.delete(sessionId)

				if (player.login_count === 0) {
					sockets.delete(player.identifier)
					eventQueue.push({
						type: 'leave',
						data: { identifier: player.identifier },
					})
				}
			})
		} catch (e) {
			log('error: %s', e)
			ws.close()
		}
	}

	async handleApi(req: Request, res: Response) {
		res.json({
			round: this.round,
			players: this.game.players,
			objects: this.game.objects,
		})
	}

	public checkDeath = throttle(this.checkDeathImpl.bind(this), 1)
	private checkDeathImpl() {
		log('check death impl')
		this.game.players.forEach((current_player: Player) => {
			if (
				!current_player.alive &&
				!this.game.isPlayerRespawn(current_player)
			) {
				// sentence death
				// respawn_time is game tick
				const respawn_time = 10 // TODO: random here OuO?
				this.game.respawnPlayer(current_player, respawn_time)

				eventQueue.push({
					type: 'death',
					data: {
						victim_identifier: current_player.identifier,
						attacker_identifier: current_player.last_damage_from,
						respawn_time,
					},
				})
			}
		})
	}

	private tickInterval: NodeJS.Timeout | undefined

	roundInit() {
		eventQueue.manage('round_init')
	}
	private async roundInitImpl() {
		if (this.round.status === RoundStatus.INIT) return
		this.updateStatus(RoundStatus.INIT)

		this.game.scores.clear()

		if (this.round.number % config.ROUND_PER_CYCLE == 1) {
			this.game.map = new GameMap(config.MAP_SIZE, config.MAP_SIZE)

			this.game.objects.clear()
			this.game.respawn_players.clear()

			this.game.players.forEach(player => {
				player.respawn()
				player.pos = this.game.map.getRandomSpawnPosition()
			})

			this.contexts.forEach(ctx => {
				ctx.init(this.round)
			})
		}
	}

	roundStart() {
		eventQueue.manage('round_start')
	}
	private async roundStartImpl() {
		if (this.round.status === RoundStatus.RUNNING) return
		this.updateStatus(RoundStatus.RUNNING)

		this.tickInterval = setInterval(() => {
			eventQueue.manage('round_tick')
		}, config.TICK_INTERVAL)

		this.generator.start()
	}

	private async roundTick() {
		if (this.round.status !== RoundStatus.RUNNING) return

		this.game.players.forEach(player => {
			player.action_count = Math.min(
				player.action_count + config.TICK_ACTION_COUNT,
				config.TICK_ACTION_MAX_COUNT,
			)
			if (player.alive && player.login_count > 0) {
				this.game.addScore(player, config.TICK_LIVE_SCORE)
			}
		})

		this.game.tickRespawn().forEach(respawned_player => {
			respawned_player.respawn()
			respawned_player.pos = this.game.map.getRandomSpawnPosition()
			eventQueue.push({
				type: 'respawn',
				data: {
					player: respawned_player,
				},
			})
		})

		eventQueue.push({
			type: 'tick',
			data: {
				scores: this.game.getScores(),
			},
		})
	}

	roundEnd() {
		eventQueue.manage('round_end')
	}
	private async roundEndImpl() {
		if (this.round.status === RoundStatus.END) return
		this.updateStatus(RoundStatus.END)

		clearInterval(this.tickInterval)
		this.tickInterval = undefined
		this.generator.stop()

		this.round.number++
	}

	private updateStatus(status: RoundStatus) {
		this.round.status = status
		eventQueue.push({
			type: 'round',
			data: this.round,
		})
	}
}
