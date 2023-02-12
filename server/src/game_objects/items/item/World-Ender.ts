// export interface ItemDetail {
// 	identifier: string
// 	texture: string
// 	description: string
// 	use: (ctx: Context) => void

// 	// For item that has duration
// 	total_tick?: number
// 	used_tick?: number
// 	tick?: (ctx: Context) => void
// }
import { Context } from '~/context'
import { Item } from '../item'

const DAMAGE_AMOUNT = 80

export const identifier = 'WORLD-ENDER'
export const texture = 'world_ender'
export const description = '使用衝擊波對其他玩家造成傷害，持續 20 Ticks'
export const is_rare = true
export function use(item: Item, ctx: Context) {
	item.extra_data = 20
}

export const total_tick = 20
export function tick(item: Item, ctx: Context) {
	ctx.game.players.forEach(p => {
		if (p.identifier === ctx.player.identifier) {
			return
		}
		ctx.game.dealDamage(ctx.player, p, DAMAGE_AMOUNT)
		// p.dealDamageFrom(DAMAGE_AMOUNT, ctx.player.identifier)
	})

	eventQueue.push({
		type: 'chat',
		data: {
			timestamp: Date.now(),
			from: '(server)',
			to: '(all)',
			message: `第 ${item.extra_data} 次衝擊波...`,
		},
	})
	item.extra_data--
}
export function end(item: Item, ctx: Context) {
	eventQueue.push({
		type: 'chat',
		data: {
			timestamp: Date.now(),
			from: '(server)',
			to: '(all)',
			message: '衝擊波結束',
		},
	})
}
