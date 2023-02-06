import { GameMap } from './gamemap'
import { Player } from './player'
import { GameObject } from '~/game_objects/game_object'
import { EventQueue } from '~/event_queue'

export class Game {
	players = new Set<Player>()
	objects = new Map<string, GameObject>()
	scores = new Map<string, number>()

	constructor(
		public map: GameMap,
		public eventQueue: EventQueue,
	) {}
	addPlayer(player: Player) {
		if (player.login_count++ == 0) {
			player.pos = this.map.getRandomSpawnPosition()
			this.players.add(player)
		}
	}
	removePlayer(player: Player) {
		if (--player.login_count === 0) {
			this.players.delete(player)
		}
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

	addScore(player: Player, score: number) {
		this.updateScore(player, (this.scores.get(player.identifier) ?? 0) + score)
	}

	updateScore(player: Player, score: number) {
		this.scores.set(player.identifier, score)
	}

	getScores() {
		return Array.from(this.scores.entries())
			.map(([identifier, score]) => ({ identifier, score }))
			.sort((a, b) => b.score - a.score)
	}
}
