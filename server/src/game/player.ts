import { Vec2, Identifier, InitIdentifier } from '~/protocol'
import { GameObject } from '~/game_objects/game_object'
import { Weapon } from '~/game_objects/equipments/weapon'
import { Armor } from '~/game_objects/equipments/armor'
import { TICK_ACTION_COUNT } from '~/config'
import { Achievements } from '~/achievement'

export const DEFAULT_HP = 10
export const DEFAULT_POS: Vec2 = [1, 1]

export class Player {
	constructor(public identifier: Identifier, public name: string) { }

	max_hp: number = DEFAULT_HP
	hp: number = DEFAULT_HP
	exp: number = 0
	atk: number = 1
	def: number = 1
	pos: Vec2 = DEFAULT_POS
	facing: Vec2 = [1, 0]

	alive: boolean = true
	// player identifier of attacker
	last_damage_from: Identifier = InitIdentifier

	current_weapon: Weapon = new Weapon()
	current_armor: Armor = new Armor()
	inventory = new Map<string, GameObject>()

	login_count: number = 0
	// should decrement this after received action from client reset each game tick
	action_count = TICK_ACTION_COUNT

	achievements = new Achievements()

	dump() {
		return {
			identifier: this.identifier,
			name: this.name,
			max_hp: this.max_hp,
			hp: this.hp,
			exp: this.exp,
			atk: this.atk,
			def: this.def,
			pos: this.pos,
			facing: this.facing,
			alive: this.alive,
			last_damage_from: this.last_damage_from,
			current_weapon: this.current_weapon,
			current_armor: this.current_armor,
			inventory: Array.from(this.inventory.values()),
			action_count: this.action_count,
			achievements: this.achievements.dump(),
		}
	}

	addObjectToInventory(object: GameObject) {
		this.inventory.set(object.uuid, object)
	}
	getObjectFromInventory(uuid: string) {
		return this.inventory.get(uuid)
	}

	heal(amount: number) {
		if (this.hp + amount > this.max_hp) {
			this.hp = this.max_hp
			return
		}

		this.hp += amount
	}

	addMaxHp(amount: number) {
		this.max_hp += amount
		this.hp += amount
	}

	removeMaxHp(amount: number) {
		this.max_hp -= amount

		// remove the exceed hp from player
		if (this.hp > this.max_hp) {
			this.hp = this.max_hp
		}
	}

	removeObjectFromInventory(object: GameObject | string) {
		return this.inventory.delete(typeof object === 'string' ? object : object.uuid)
	}

	dealDamage(damage: number): boolean {
		if (!this.alive) return false
		this.hp -= damage
		if (this.hp <= 0) {
			this.death()
			return true
		}
		return false
	}

	dealDamageFrom(damage: number, identifier: Identifier) {
		this.last_damage_from = identifier
		return this.dealDamage(damage)
	}

	death() {
		this.alive = false
		this.hp = -1
	}

	respawn() {
		this.alive = true
		this.hp = DEFAULT_HP
		this.exp = 0
		this.atk = 1
		this.def = 1
		this.facing = [1, 0]
		this.current_weapon = new Weapon()
		this.current_armor = new Armor()
		this.inventory.clear()
	}
}

export type PlayerPub = ReturnType<Player['dump']>
