import { GameMap } from './gamemap'
import { Player } from './player'
import { GameObject } from '@/game_objects/game_object'

export class Game {
	players = new Set<Player>()
	objects = new Map<string, GameObject>()

	constructor(
		public map: GameMap
	) {}
	addPlayer(player: Player) {
		if (player.login_count++ == 0) {
			player.pos = this.map.getRandomSpawnPosition()
			this.players.add(player)
		}
	}
	removePlayer(player: Player) {
		if (--player.login_count === 0)
			this.players.delete(player)
	}
	addObject(object: GameObject) {
		this.objects.set(object.uuid, object)
		this.map.dropGameObject(object)
	}
	getObject(uuid: string) {
		return this.objects.get(uuid)
	}
	removeObject(object: GameObject | string) {
		return this.objects.delete(typeof object === 'string' ? object : object.uuid)
	}
}
