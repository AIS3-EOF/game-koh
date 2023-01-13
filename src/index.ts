import { WebSocketServer } from 'ws'
import { dispatch } from './handlers'
import { Context } from './context'
import { ServerMessage } from './protocol/server'
import { Game } from './game'
import { GameMap } from './game/gamemap'

const wss = new WebSocketServer({ port: 8080 })
const game = new Game(GameMap.generate(10, 10))

wss.on('connection', ws => {
	const ctx = new Context(ws, game)
	ws.on('message', rawData => {
		const msg: ServerMessage = JSON.parse(rawData.toString())
		dispatch(ctx, msg)
	})
})
