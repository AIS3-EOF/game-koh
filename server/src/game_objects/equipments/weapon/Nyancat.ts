import { Vec2 } from '~/protocol'
import { Player } from '~/game'
import { Context } from '~/context'
import { Weapon } from '../weapon'

export const identifier = 'Nyancat'
export const texture = 'Nyancat.'
export const can_transfer = true
export const attack_modifier = 1

/*
---
-O-
---
 */
export const range: Vec2[] = []

export function calc(
	attacker: Player,
	target: Player,
): { damage: number; effect: number } {
	const damage = Math.max(0, attacker.atk + attack_modifier - target.def)
	return { damage, effect: damage }
}

export function hit(ctx: Context) {
	eventQueue.push({
		type: 'chat',
		data: {
			from: 'Nyancat',
			to: '(all)',
			message: 'meow',
		},
	})
}
