import { Vec2 } from '~/protocol'
import { Player } from '~/game'
import { Context } from '~/context'
import { Weapon } from '../weapon'

export const identifier = 'Nyancat'
export const texture = 'nyancat'
export const can_transfer = true
export const description = '普通攻擊是全體傷害的喵喵喔！ 🐈🫴'
export const attack_modifier = 2

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
			from: ctx.player.identifier,
			to: '(all)',
			advanced: true,
			// colorful bbcode
			message: '[color=#ff0000]N[/color][color=#ff7f00]y[/color][color=#ffff00]a[/color][color=#00ff00]n[/color][color=#0000ff]c[/color][color=#4b0082]a[/color][color=#9400d3]t[/color]!',
		},
	})
}
