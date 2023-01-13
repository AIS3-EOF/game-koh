import { Vec2 } from '../protocol/shared'

export const DEFAULT_HP = 100

export class Player {
	private hp: number = DEFAULT_HP
	private exp: number = 0
	private atk: number = 1
	private def: number = 1
	private pos: Vec2 = [0, 0]
	private facing: Vec2 = [0, 0]
}
