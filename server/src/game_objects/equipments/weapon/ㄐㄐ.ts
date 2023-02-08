import { Vec2 } from '~/protocol'
import { Weapon } from '../weapon'

export const identifier = 'ㄐㄐ'
export const texture = 'ㄐㄐ'
export const can_transfer = true
export const attack_modifier = 1

/*
---
-OXXXXX*40
---
 */
const R = 40
export const range: Vec2[] = Array.from({ length: R }, (_, i) => [0, i + 1])
