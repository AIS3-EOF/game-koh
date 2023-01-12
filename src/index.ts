import { WebSocketServer } from 'ws'
import { Handler, Context } from './handlers/index'
import { ServerMessage } from './protocol/server'
import { ClientMessage } from './protocol/client'

const wss = new WebSocketServer({ port: 8080 })
const handler = new Handler()

wss.on('connection', ws => {
	const ctx = new Context()
	ctx.send = (msg: ClientMessage) => ws.send(JSON.stringify(msg))
	ws.on('message', rawData => {
		const msg: ServerMessage = JSON.parse(rawData.toString())
		handler.handle(ctx, msg)
	})
})
