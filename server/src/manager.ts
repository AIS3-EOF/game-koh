import { WebSocket } from 'ws'
import { Db } from 'mongodb'
import { debug } from 'debug'
import { randomUUID } from 'crypto'
import * as poisson from 'poisson-process'
import { result, throttle } from 'underscore'
import type { Request, Response } from 'express'

import { dispatch } from '~/handlers'
import { Context } from '~/context'
import { ServerMessage } from '~/protocol'
import { RoundData, RoundStatus, RoundMessage, InitRoundData } from '~/round'
import { Game, GameMap, Player } from '~/game'
import { GameObject, generateObject } from '~/game_objects'
import { handleLogin } from '~/handle_login'
import * as config from '~/config'
import { Parser } from '~/parser'

const verbose = debug('server:manager:debug')
const log = debug('server:manager:log')
const warn = debug('server:manager:warn')
const error = debug('server:manager:error')

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

	private ticking_objects: TickObjectData[] = [] // object_uuid, remain_tick
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
			const parser = new Parser()
			await parser.initServer(ws)
			const sessionId = randomUUID()
			log('%s connected', sessionId)
			const player = await handleLogin(ws, parser)
			this.game.addPlayer(player)
			eventQueue.push({
				type: 'join',
				data: {
					player: player.dump(),
				},
			})
			log('%s logined as %s', sessionId, player.name)
			const ctx = new Context(parser, sessionId, ws, this.game, player)
			sockets.add(player.identifier, ctx)
			ctx.init(this.round)
			this.contexts.set(sessionId, ctx)
			ws.on('message', async (rawData: Buffer) => {
				try {
					const msg: ServerMessage = await parser.parse(
						new Uint8Array(rawData).buffer,
					)
					verbose('%s received %o', sessionId, msg)
					if (this.round.status === RoundStatus.RUNNING) {
						dispatch(ctx, msg)
					} else {
						ctx.send({
							type: 'error',
							data: `Round ${this.round.id} ${
								RoundMessage[this.round.status]
							}`,
						})
					}
				} catch (e) {
					error('error: %s', e)
					ws.close()
				}
			})
			ws.on('close', () => {
				log('%s disconnected', sessionId)
				this.game.removePlayer(player)
				this.contexts.delete(sessionId)

				if (player.login_count === 0) {
					sockets.delete(player.identifier, ctx)
					eventQueue.push({
						type: 'leave',
						data: { identifier: player.identifier },
					})
				}
			})
		} catch (e) {
			if (e instanceof Error) error(e)
			else warn('warn: %s', e)
			ws.close()
		}
	}

	async handleApi(req: Request, res: Response) {
		res.json({
			VERSION,
			round: this.round,
		})
	}

	checkDeath() {
		verbose('Checking death')
		this.game.players.forEach((current_player: Player) => {
			if (
				!current_player.alive &&
				!this.game.isPlayerRespawn(current_player)
			) {
				// sentence death
				// respawn_time is game tick
				// TODO: random here OuO?
				const respawn_time =
					config.RESPAWN_TIME_MIN +
					Math.ceil(Math.random() * config.RESPAWN_TIME_MAX)
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

	updateRound(round: Partial<RoundData>) {
		if (round.start) this.round.start = round.start
		if (round.end) this.round.end = round.end

		if (!round.status || this.round.status === round.status) return false

		switch (round.status) {
			case RoundStatus.PREINIT:
			case RoundStatus.INIT:
				if (this.round.start === RoundStatus.RUNNING)
					error('round status: RUNNING -> INIT')
				this.roundEnd()
				break
			case RoundStatus.RUNNING:
				if (this.round.start === RoundStatus.END)
					error('round status: END -> RUNNING')
				break
			case RoundStatus.END:
				if (this.round.start === RoundStatus.INIT)
					error('round status: INIT -> END')
				break
		}

		if (round.id) this.round.id = round.id
		log(`Round ${this.round.id} ${RoundMessage[round.status]}`)

		return true
	}

	roundInit() {
		if (!this.updateStatus(RoundStatus.INIT)) return

		this.game.resetAchievementReward()
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
		if (!this.updateStatus(RoundStatus.RUNNING)) return

		this.tickInterval = setInterval(
			this.roundTick.bind(this),
			config.TICK_INTERVAL,
		)

		this.generator.start()
	}

	private roundTick() {
		if (this.round.status !== RoundStatus.RUNNING) return

		// TODO: Not sure is this implementation thread-safe
		// CSY: If the is JS, then it must thread-safe
		this.ticking_objects = this.ticking_objects.filter(obj => {
			try {
			obj.tick_fn(obj.tick_count)
			if (obj.forever) return true
			return obj.tick_count-- > 0
			} catch (e) {
				error('ticking_object(%s): %s', obj.identifier, e)
				return false
			}
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

		// if current time is after round end, then we should go to roundEnd immediately
		const end = new Date(this.round.end!).getTime()
		if (Date.now() >= end) this.updateRound({ status: RoundStatus.END })

		this.savedata()
	}

	roundEnd() {
		if (!this.updateStatus(RoundStatus.END)) return

		clearInterval(this.tickInterval)
		this.tickInterval = undefined
		this.generator.stop()

		// System is working with ADsys now, we don't have to maintain this anymore.
		//this.round.id++

		if (!!process.env.SCOREBOARD_URL) {
			db.collection('rank').insertOne({
				round_id: this.round.id,
				rank: this.lastrank(),
				scores: this.game.getScores(),
			})
		}
	}

	lastrank() {
		return this.game.getScores().reduce(
			(acc, team, idx, ary) => [
				...acc,
				{
					team: team.identifier,
					rank:
						idx === 0
							? 1
							: team.score === ary[idx - 1].score
							? acc[idx - 1].rank
							: idx + 1,
				},
			],
			[] as { team: number; rank: number }[],
		)
	}

	async rank(round_id: number) {
		if (!process.env.SCOREBOARD_URL) return null

		const res = await db.collection('rank').findOne({ round_id })
		if (res) return res.rank
		// in DEV mode, always return rank to ADSys
		if (DEVELOPMENT) return []
		return null
	}

	private updateStatus(status: RoundStatus) {
		if (this.round.status === status) return false
		this.round.status = status
		eventQueue.push({
			type: 'round',
			data: this.round,
		})
		return true
	}

	private tickObject(data: TickObjectData) {
		this.ticking_objects.push(data)
	}

	private removeTickObject(data: TickObjectData) {
		this.ticking_objects = this.ticking_objects.filter(obj => {
			return obj !== data
		})
	}

	async savedata() {
		verbose('Saving data...')
		const tasks: Promise<any>[] = []
		tasks.push(
			...Array.from(this.game.players.values(), player =>
				db.collection('players').updateOne(
					{ identifier: player.identifier },
					{
						$set: {
							identifier: player.identifier,
							achievements: player.achievements.save(),
						},
					},
					{ upsert: true },
				),
			),
		)
		tasks.push(
			db.collection('scores').updateOne(
				{ round_id: this.round.id },
				{
					$set: {
						round_id: this.round.id,
						scores: this.game.getScores(),
					},
				},
				{ upsert: true },
			),
		)
		const results = await Promise.allSettled(tasks)
		results.forEach(result => {
			if (result.status === 'rejected') {
				error('Error saving data:', result.reason)
			}
		})
		verbose('Data saved.')
		return results
	}

	async loaddata() {}
}
