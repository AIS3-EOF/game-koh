import { WebSocket } from 'ws'
import { ClientMessage } from './protocol/client'
import { Game } from './game/game'
import { Player } from './game/player'
import { GameObject } from './game_objects/game_object'
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
	sendError(msg: string) {
		this.send({
			type: 'error',
			data: msg
		})
	}
	getObject(uuid: string) {
		return this.game.getObject(uuid) ?? this.player.getObject(uuid)
	}
	removeObject(object: GameObject) {
		return this.game.removeObject(object) || this.player.removeObject(object)
	}
}
