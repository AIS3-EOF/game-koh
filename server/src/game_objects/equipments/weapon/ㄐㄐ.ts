import { Vec2 } from '~/protocol'
import { Weapon } from '../weapon'

export const identifier = 'ㄐㄐ'
export const texture = 'chi_chi'
export const can_transfer = true
export const description = '超遠距離ㄐㄐ'
export const attack_modifier = 2

/*
---
-OXXXXX*30
---
 */
const R = 30
export const range: Vec2[] = Array.from({ length: R }, (_, i) => [0, i + 1])
