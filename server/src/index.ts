import { WebSocketServer, WebSocket } from 'ws'
import { debug } from 'debug'
import { randomUUID } from 'crypto'
import * as poisson from 'poisson-process'

import { dispatch } from '@/handlers'
import { Context } from '@/context'
import { ServerMessage } from '@/protocol/server'
import { Game } from '@/game/game'
import { GameMap } from '@/game/gamemap'
import { Player } from '@/game/player'
import { EventQueue } from '@/event_queue'
import { generateObject } from '@/game_objects'
import { connect } from '@/db'
import { handleLogin } from '@/handle_login'
import * as config from '@/config'
import parser from '@/parser'

const log = debug('server:main')
const wss = new WebSocketServer({ port: 8080 })
const game = new Game(GameMap.generate(config.MAP_SIZE, config.MAP_SIZE))

const contexts = new Map<string, Context>()
const eventQueue = new EventQueue()
eventQueue.on('event', event => {
	for (const ctx of contexts.values()) {
		ctx.send(event)
	}
})
setInterval(() => {
	game.players.forEach(player => {
		player.action_count = Math.min(
			player.action_count + config.TICK_ACTION_COUNT,
			config.TICK_ACTION_MAX_COUNT
		)
	})

}, config.TICK_INTERVAL)

poisson.create(config.GEN_DURATION, () => {
	const object = generateObject()
	game.addObject(object)
	eventQueue.push({
		type: 'new_object_spawned',
		data: { object },
	})
}).start()

connect().then(db => {
	log('connected to database')
	wss.on('connection', async ws => {
		try {
			const sessionId = randomUUID()
			log('%s connected', sessionId)
			const player = await handleLogin(ws, db)
			eventQueue.push({
				type: 'join',
				data: {player},
			})
			game.addPlayer(player)
			log('%s logined', sessionId)
			const ctx = new Context(sessionId, ws, game, player, eventQueue, db)
			ctx.send({
				type: 'init',
				data: {
					player,
					players: Array.from(game.players.values()),
					objects: Array.from(game.objects.values()),
					map: game.map,
				},
			})
			contexts.set(sessionId, ctx)
			ws.on('message', rawData => {
				try {
					const msg: ServerMessage = parser.parse(rawData.toString())
					log('%s received %o', sessionId, msg)
					dispatch(ctx, msg)
				} catch (e) {
					log('error: %s', e)
					ws.close()
				}
			})
			ws.on('close', () => {
				log('%s disconnected', sessionId)
				game.removePlayer(player)
				contexts.delete(sessionId)
			})
		} catch (e) {
			log('error: %s', e)
			ws.close()
		}
	})
})

// if (require.main === module) {
	const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
	;(async () => {
		await sleep(1000)
		const ws = new WebSocket('ws://localhost:8080')
		ws.on('open', async () => {
			ws.send(
				parser.stringify({
					type: 'login',
					data: {
						token: 'test'
					}
				})
			)
			await sleep(1000)
			ws.send(parser.stringify({ type: 'move', data: { facing: [1, 0], vec: [1, 0] } }))
			await sleep(3000)
			// ws.close()
		})
		const log = debug('client:message')
		ws.on('message', data => {
			console.log(new Date().toLocaleString(), parser.parse(data.toString()))
		})
	})()
// }
