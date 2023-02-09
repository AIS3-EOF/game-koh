import { Vec2 } from '~/protocol'
import { Weapon } from '../weapon'
import { Context } from '~/context'
import { Player } from '~/game'
import { handle as handle_chat } from '~/handlers/chat'

const TICK_DAMAGE = 1

export const identifier = '冰桶挑戰'
export const texture = 'ice_bucket_challenge'
export const can_transfer = true
export const description = '潑出去的水是收不回來的，可以對敵人造成著涼效果'
export const attack_modifier = 2

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

export const tick_count = 3
export const tick = (ctx: Context, target: Player) => {
	ctx.game.dealDamage(ctx.player, target, TICK_DAMAGE)
	handle_chat(ctx, {
		from: '(server)',
		to: target.identifier,
		message: '[敵人的冰桶挑戰] 你覺得寒冷：-1 HP',
	})
	// eventQueue.push({
	// 	type: 'chat',
	// 	data: {
	// 		from: '(server)',
	// 		to: target.identifier,
	// 		message: '[敵人的冰桶挑戰] 你覺得寒冷：-1 HP',
	// 	},
	// })
}
