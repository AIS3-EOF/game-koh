import { WebSocketServer } from 'ws'
import { Handler } from './handlers/index'
import { Context } from './context'
import { ServerMessage } from './protocol/server'

const wss = new WebSocketServer({ port: 8080 })
const handler = new Handler()

wss.on('connection', ws => {
	const ctx = new Context(ws)
	ws.on('message', rawData => {
		const msg: ServerMessage = JSON.parse(rawData.toString())
		handler.handle(ctx, msg)
	})
})
