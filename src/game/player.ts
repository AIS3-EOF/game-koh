import { Vec2 } from '../protocol/shared'

export const DEFAULT_HP = 100

export class Player {
	identifier: string = ''
	hp: number = DEFAULT_HP
	exp: number = 0
	atk: number = 1
	def: number = 1
	pos: Vec2 = [0, 0]
	facing: Vec2 = [0, 0]
}
