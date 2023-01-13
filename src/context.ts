import { WebSocket } from 'ws'
import { ClientMessage } from './protocol/client'
import { Game } from './game'

/**
 * Per-connection context
 * Player data
 * Database connection (?)
 */

export class Context {
	constructor(private ws: WebSocket, public game: Game) {}
	send(msg: ClientMessage) {
		this.ws.send(JSON.stringify(msg))
	}
}
