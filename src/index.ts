import { WebSocketServer, WebSocket } from 'ws'
import { dispatch } from './handlers'
import { Context } from './context'
import { ServerMessage } from './protocol/server'
import { SyncMessage } from './protocol/client'
import { Game } from './game'
import { GameMap } from './game/gamemap'
import { Player } from './game/player'
import { EventQueue } from './event_queue'
import { connect } from './db'
import { debug } from 'debug'
import { randomUUID } from 'crypto'

const log = debug('server:main')
const wss = new WebSocketServer({ port: 8080 })
const game = new Game(GameMap.generate(10, 10))

const TICK_INTERVAL = 1000
const contexts = new Map<string, Context>()
const eventQueue = new EventQueue()
eventQueue.on('tick', events => {
	const sync: SyncMessage = {
		type: 'sync',
		data: {
			// need to make sure that `game.players` doesn't have some sensitive data
			players: game.players,
			events
		}
	}
	for (const ctx of contexts.values()) {
		ctx.send(sync)
	}
})
setInterval(eventQueue.tick.bind(eventQueue), TICK_INTERVAL)

const dbPromise = connect()

wss.on('connection', async ws => {
	const sessionId = randomUUID()
	log('%s connected', sessionId)
	const player = new Player()
	game.addPlayer(player)
	const ctx = new Context(sessionId, ws, game, player, eventQueue, await dbPromise)
	contexts.set(sessionId, ctx)
	ws.on('message', rawData => {
		const msg: ServerMessage = JSON.parse(rawData.toString())
		log('%s received %o', sessionId, msg)
		dispatch(ctx, msg)
	})
	ws.on('close', () => {
		log('%s disconnected', sessionId)
		game.removePlayer(player)
	})
})

if (require.main === module) {
	const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
	const ws = new WebSocket('ws://localhost:8080')
	ws.on('open', async () => {
		ws.send(
			JSON.stringify({
				type: 'login'
			})
		)
		await sleep(1000)
		ws.send(JSON.stringify({ type: 'move', data: { facing: [1, 0], vec: [1, 0] } }))
		await sleep(3000)
		ws.close()
	})
	ws.on('message', data => {
		console.log(data.toString())
	})
}
