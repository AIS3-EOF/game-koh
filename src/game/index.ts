import { GameMap } from './gamemap'
import { Player } from './player'

export class Game {
	private players: Player[] = []
	constructor(public map: GameMap) {}
	addPlayer(player: Player) {
		this.players.push(player)
	}
	removePlayer(player: Player) {
		const index = this.players.indexOf(player)
		if (index !== -1) {
			this.players.splice(index, 1)
		}
	}
}
