import { Vec2 } from '~/protocol'
import { Weapon } from '../weapon'

export const identifier = '半月刀'
export const texture = 'half_moon_sword'
export const can_transfer = true
export const description = '代替月亮來懲罰大家'
export const attack_modifier = 5

/*
---
XOX
---
 */
export const range: Vec2[] = [
	[0, 1],
	[0, -1],
]
