import { WebSocket } from 'ws'
import { ClientMessage } from './protocol/client'

/**
 * Per-connection context
 * Player data
 * Database connection (?)
 */

export class Context {
	ws: WebSocket
	constructor(ws: WebSocket) {
		this.ws = ws
	}
	send(msg: ClientMessage) {
		this.ws.send(JSON.stringify(msg))
	}
}
