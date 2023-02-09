import { WebSocket } from 'ws'
import { Db } from 'mongodb'

import { RoundData } from '~/round'
import { ClientMessage } from '~/protocol'
import { Game, Player } from '~/game'
import { GameObject } from '~/game_objects/game_object'
import parser from '~/parser'

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
	) { }
	init(round: RoundData) {
		this.send({
			type: 'init',
			data: {
				player: this.player,
				players: Array.from(this.game.players.values()),
				objects: Array.from(this.game.objects.values()),
				map: this.game.map,
				round,
			},
		})
	}
	send(msg: ClientMessage) {
		this.ws.send(parser.stringify(msg))
	}
	sendError(msg: string) {
		this.send({
			type: 'error',
			data: msg,
		})
	}
	getObject(uuid: string) {
		return (
			this.game.getObject(uuid) ??
			this.player.getObjectFromInventory(uuid)
		)
	}
	removeObject(object: GameObject) {
		return (
			this.game.removeObject(object) ||
			this.player.removeObjectFromInventory(object)
		)
	}
	addScore(score: number) {
		this.game.addScore(this.player, score)
	}
}
