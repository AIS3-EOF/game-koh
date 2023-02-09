import { Vec2 } from '~/protocol'
import { Weapon } from '../weapon'

export const identifier = '星爆氣流斬'
export const texture = 'c8763'
export const can_transfer = true
export const description = '那到底是什麼技能啊'
export const attack_modifier = 25

/*
-XXXXXX
-OXXXXX
-XXXXXX
*/
export const range: Vec2[] = [
	[-1, 0],
	[-1, 1],
	[-1, 2],
	[-1, 3],
	[-1, 4],
	[-1, 5],
	[0, 1],
	[0, 2],
	[0, 3],
	[0, 4],
	[0, 5],
	[1, 0],
	[1, 1],
	[1, 2],
	[1, 3],
	[1, 4],
	[1, 5],
]
