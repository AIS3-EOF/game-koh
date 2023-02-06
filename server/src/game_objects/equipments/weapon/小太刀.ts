import { Vec2 } from '~/protocol'
import { Weapon } from '../weapon'

export const identifier = '小太刀'
export const texture = 'dagger'
export const can_transfer = true
export const attack_modifier = 1

/*
--X
-OX
--X
 */
export const range: Vec2[] = [
  [0,1], [1, 1], [-1, 1]
]