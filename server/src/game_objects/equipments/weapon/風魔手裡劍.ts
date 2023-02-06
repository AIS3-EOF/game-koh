import { Vec2 } from '@/protocol'
import { Weapon } from '../weapon'

export const identifier = '風魔手裡劍'
export const texture = 'sword'
export const can_transfer = true
export const attack_modifier = 1

/*
---
-OXXXXX
---
 */
const R = 5
export const range: Vec2[] = Array.from({ length: R }, (_, i) => [0, i+1])