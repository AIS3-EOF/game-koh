import { Vec2 } from '~/protocol'
import { Weapon } from '../weapon'

export const identifier = '風魔手裡劍'
export const texture = 'ninja_shuriken'
export const can_transfer = true
export const description = 'Mid Zed or feed，你是兒童劫還是 Faker 勒？'
export const attack_modifier = 20

/*
---
-OXXXXXX
---
 */
const R = 6
export const range: Vec2[] = Array.from({ length: R }, (_, i) => [0, i + 1])
