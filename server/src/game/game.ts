import { GameMap } from './gamemap'
import { Player } from './player'
import { GameObject } from '~/game_objects/game_object'
import { Identifier } from '~/protocol'
import { DAMAGE_SCORE, KILL_SCORE } from '~/config'

export class Game {
	players = new Set<Player>()
	objects = new Map<string, GameObject>()
	scores = new Map<Identifier, number>()
	id2name = new Map<Identifier, string>()
	respawn_players = new Map<Player, number>()

	constructor(public map: GameMap) { }

	addPlayer(player: Player) {
		if (player.login_count++ == 0) {
			player.pos = this.map.getRandomSpawnPosition()
			this.players.add(player)
			this.id2name.set(player.identifier, player.name)
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
		return this.objects.delete(
			typeof object === 'string' ? object : object.uuid,
		)
	}

	addScore(player: Player, score: number) {
		this.updateScore(
			player,
			(this.scores.get(player.identifier) ?? 0) + score,
		)
	}

	updateScore(player: Player, score: number) {
		this.scores.set(player.identifier, score)
	}

	getScores() {
		return Array.from(this.scores.entries())
			.map(([identifier, score]) => ({
				identifier,
				name: this.id2name.get(identifier) ?? 'Unknown',
				score,
			}))
			.sort((a, b) => b.score - a.score)
	}

	dealDamage(from: Player, to: Player, damage: number): boolean {
		if (!to.alive) {
			return true
		}

		let killed = to.dealDamageFrom(damage, from.identifier)
		// TODO: Damage scoring algorithm
		if (from !== to) {
			this.addScore(from, DAMAGE_SCORE * damage * 0.5)

			if (killed) {
				this.addScore(from, KILL_SCORE)
			}
		}

		return killed
	}

	resetAchievementReward() {
		this.players.forEach((p) => {
			p.achievements.resetReward()
		})
	}
}
