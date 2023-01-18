import { Vec2 } from '../protocol/shared'
import { GameObject } from '../game_objects/game_object'
import { Weapon } from '../game_objects/equipments/weapon'
import { Armor } from '../game_objects/equipments/armor'

export const DEFAULT_HP = 100

export class Player {
	identifier: string = ''
	hp: number = DEFAULT_HP
	exp: number = 0
	atk: number = 1
	def: number = 1
	pos: Vec2 = [0, 0]
	facing: Vec2 = [0, 0]

	current_weapon: Weapon = new Weapon();
	current_armor: Armor = new Armor();
	inventory: GameObject[] = []
}
