import { GameMap } from './gamemap'
import { Player } from './player'
import { GameObject } from '~/game_objects/game_object'

export class Game {
	players = new Set<Player>()
	objects = new Map<string, GameObject>()
	scores = new Map<string, number>()
	respawn_players = new Map<Player, number>()

	constructor(
		public map: GameMap,
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

	isPlayerRespawn(player: Player): boolean {
		return this.respawn_players.has(player)
	}

	respawnPlayer(player: Player, respawn_time: number) {
		this.respawn_players.set(player, respawn_time)
	}

	tickRespawn(): Player[] {
		let respawned = [] as Player[]
		this.respawn_players.forEach((time, player, map) => {
			time -= 1
			if (time > 0) {
				map.set(player, time)
			} else {
				player.respawn()
				respawned.push(player)
				map.delete(player)
			}
		})

		return respawned
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
