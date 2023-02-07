import { Vec2 } from '~/protocol'
import { GameObject } from '~/game_objects/game_object'
import { Weapon } from '~/game_objects/equipments/weapon'
import { Armor } from '~/game_objects/equipments/armor'
import { TICK_ACTION_COUNT } from '~/config'
import { Achievements } from '~/achievement'

export const DEFAULT_HP = 10
export const DEFAULT_POS: Vec2 = [1, 1]

export class Player {
	constructor(
		public identifier: string = ''
	) {
	}

	max_hp: number = DEFAULT_HP
	hp: number = DEFAULT_HP
	exp: number = 0
	atk: number = 1
	def: number = 1
	pos: Vec2 = DEFAULT_POS
	facing: Vec2 = [1, 0]

	alive: boolean = true
	// player identifier of attacker
	last_damage_from: string = ''

	current_weapon: Weapon = new Weapon();
	current_armor: Armor = new Armor();
	inventory: GameObject[] = [];

	login_count: number = 0;
	// should decrement this after received action from client reset each game tick
	action_count = TICK_ACTION_COUNT;

	achievements = new Achievements()

	addObjectToInventory(object: GameObject) {
		this.inventory.push(object)
	}
	getObjectFromInventory(uuid: string) {
		return this.inventory.find((obj) => obj.uuid === uuid)
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
		if (typeof object === 'string') {
			const tmp = this.getObjectFromInventory(object)
			if (!tmp) return false
			object = tmp
		}
		const idx = this.inventory.indexOf(object)
		if (idx === -1) return false
		this.inventory.splice(idx, 1)
		return true
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
		this.current_weapon = new Weapon();
		this.current_armor = new Armor();
		this.inventory = [];
	}
}
