import { Vec2 } from '~/protocol'
import { Weapon } from '../weapon'

export const identifier = '冰桶挑戰'
export const texture = 'ice_bucket_challenge'
export const can_transfer = true
export const description = '潑出去的水是收不回來的'
export const attack_modifier = 1

/*
xxxxx
xxxxx
xxOxx
xxxxx
xxxxx
 */
const R = 2
const W = R * 2 + 1
export const range: Vec2[] = Array.from({ length: W })
	.map((_, i) =>
		Array.from({ length: W }).map((_, j) => {
			return [i - R, j - R] as Vec2
		}),
	)
	.reduce((a, b) => a.concat(b), [])
	.filter(([x, y]) => x || y)
