import { Vec2 } from '@/protocol'
import { GameObject } from '@/game_objects/game_object'
import { Weapon } from '@/game_objects/equipments/weapon'
import { Armor } from '@/game_objects/equipments/armor'
import { TICK_ACTION_COUNT } from '@/config'
import { Achievements } from '@/achievement'

export const DEFAULT_HP = 10
export const DEFAULT_POS: Vec2 = [1, 1]

export class Player {
	constructor(
		public identifier: string = ''
	) {
		for (let i = 0; i < 10; i++) {
			this.inventory.push(new Weapon())
			this.inventory.push(new Armor())
		}
	}

	hp: number = DEFAULT_HP
	exp: number = 0
	atk: number = 1
	def: number = 1
	pos: Vec2 = DEFAULT_POS
	facing: Vec2 = [1, 0]

	alive = true

	current_weapon: Weapon = new Weapon();
	current_armor: Armor = new Armor();
	inventory: GameObject[] = [];

	login_count: number = 0;
	action_count = TICK_ACTION_COUNT;
	// should decrement this after received action from client reset each game tick

	achievements = new Achievements()

	addObjectToInventory(object: GameObject) {
		this.inventory.push(object)
	}
	getObjectFromInventory(uuid: string) {
		return this.inventory.find((obj) => obj.uuid === uuid)
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
