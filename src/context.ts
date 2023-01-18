import { WebSocket } from 'ws'
import { ClientMessage } from './protocol/client'
import { Game } from './game'
import { Player } from './game/player'
import { EventQueue } from './event_queue'
import { Db } from 'mongodb'

/**
 * Per-connection context
 * Player data
 * Database connection (?)
 */

export class Context {
	constructor(
		private id: string,
		private ws: WebSocket,
		public game: Game,
		public player: Player,
		public eventQueue: EventQueue,
		public db: Db
	) {}
	send(msg: ClientMessage) {
		this.ws.send(JSON.stringify(msg))
	}
	scheduleSync() {
		// this function must be called after the game state has been updated
	}
}
