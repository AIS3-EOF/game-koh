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
import { RoundData, RoundStatus, RoundMessage, InitRoundData } from '~/round'
import { Game, GameMap, Player } from '~/game'
import { GameObject, generateObject } from '~/game_objects'
import { handleLogin } from '~/handle_login'
import * as config from '~/config'
import parser from '~/parser'

const log = debug('server:manager')

export type ManagerEvent =
	| 'tick_object' // Arg: TickObjectData
	| 'remove_tick_object' // Arg: TickObjectData

export interface TickObjectData {
	identifier: string
	tick_count: number
	tick_fn: (tick: number) => void
	forever?: boolean
}

export class Manager {
	public contexts: Map<string, Context>
	public game: Game
	public generator: poisson.PoissonInstance

	private ticking_objects: TickObjectData[] = []	// object_uuid, remain_tick
	public round: RoundData = InitRoundData

	constructor() {
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

	handleEvent(event: ManagerEvent, data: any) {
		log('handle event %s', event)
		switch (event) {
			case 'tick_object':
				this.tickObject(data)
				break
			case 'remove_tick_object':
				this.removeTickObject(data)
				break
		}
	}

	async handleConnection(ws: WebSocket) {
		try {
			const sessionId = randomUUID()
			log('%s connected', sessionId)
			const player = await handleLogin(ws)
			this.game.addPlayer(player)
			eventQueue.push({
				type: 'join',
				data: {
					player: player.dump(),
				},
			})
			log('%s logined as %s', sessionId, player.name)
			const ctx = new Context(sessionId, ws, this.game, player)
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
							data: `Round ${this.round.id} ${RoundMessage[this.round.status]
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
					sockets.delete(player.identifier, ws)
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

	checkDeath() {
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

	updateRound(round: RoundData) {
		if (this.round.id === round.id && this.round.status === round.status) return
		console.log(`Round ${round.id} ${RoundMessage[round.status]}`)
		this.round.id = round.id
		this.round.start = round.start
		this.round.end = round.end
		switch (round.status) {
			case RoundStatus.INIT:
				return this.roundInit()
			case RoundStatus.RUNNING:
				return this.roundStart()
			case RoundStatus.END:
				return this.roundEnd()
		}
	}


	roundInit() {
		if (this.round.status === RoundStatus.INIT) return
		this.updateStatus(RoundStatus.INIT)

		this.game.scores.clear()

		if (this.round.id % config.ROUND_PER_CYCLE == 1) {
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
		if (this.round.status === RoundStatus.RUNNING) return
		this.updateStatus(RoundStatus.RUNNING)

		this.tickInterval = setInterval(this.roundTick.bind(this), config.TICK_INTERVAL)

		this.generator.start()
	}

	roundTick() {
		if (this.round.status !== RoundStatus.RUNNING) return

		// TODO: Not sure is this implementation thread-safe
		// CSY: If the is JS, then it must thread-safe
		this.ticking_objects = this.ticking_objects.filter(obj => {
			obj.tick_fn(obj.tick_count)
			if (obj.forever)
				return true
			return obj.tick_count-- > 0
		})
		this.checkDeath()

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
					player: respawned_player.dump(),
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
		if (this.round.status === RoundStatus.END) return
		this.updateStatus(RoundStatus.END)

		clearInterval(this.tickInterval)
		this.tickInterval = undefined
		this.generator.stop()

		this.round.id++
	}

	rank() {
		return this.game.getScores()
			.reduce((acc, team, idx, ary) => ([
				...acc,
				{
					team: team.team,
					rank: idx === 0 ? 1 : team.score === ary[idx - 1].score ? acc[idx - 1].rank : idx + 1,
				},
			]), [] as { team: number, rank: number }[])
	}

	private updateStatus(status: RoundStatus) {
		this.round.status = status
		eventQueue.push({
			type: 'round',
			data: this.round,
		})
	}

	private tickObject(data: TickObjectData) {
		this.ticking_objects.push(data)
	}

	private removeTickObject(data: TickObjectData) {
		this.ticking_objects = this.ticking_objects.filter(obj => {
			return obj !== data
		})
	}
}
