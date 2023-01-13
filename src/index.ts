import { WebSocketServer, WebSocket } from 'ws'
import { dispatch } from './handlers'
import { Context } from './context'
import { ServerMessage } from './protocol/server'
import { Game } from './game'
import { GameMap } from './game/gamemap'
import { Player } from './game/player'
import { debug } from 'debug'
import { randomUUID } from 'crypto'

const log = debug('server:main')
const wss = new WebSocketServer({ port: 8080 })
const game = new Game(GameMap.generate(10, 10))

wss.on('connection', ws => {
	const sessionId = randomUUID()
	log('%s connected', sessionId)
	const player = new Player()
	game.addPlayer(player)
	const ctx = new Context(sessionId, ws, game, player)
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
	const ws = new WebSocket('ws://localhost:8080')
	ws.on('open', () => {
		ws.send(
			JSON.stringify({
				type: 'login'
			})
		)
		setTimeout(() => {
			ws.close()
		}, 3000)
	})
}
