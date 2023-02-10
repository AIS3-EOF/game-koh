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

const DAMAGE_AMOUNT = 100

export const identifier = '低軌道離子砲-LOIC'
export const texture = 'loic'
export const description = '使用低軌道離子武器，對其他玩家造成致命傷害'
export const is_rare = true
export function use(item: Item, ctx: Context) {
	item.extra_data = 5
}

export const total_tick = 5
export function tick(item: Item, ctx: Context) {
	eventQueue.push({
		type: 'chat',
		data: {
			timestamp: Date.now(),
			from: '(server)',
			to: '(all)',
			message: `低軌道離子武器轟炸倒數 ${item.extra_data}...`,
		},
	})
	item.extra_data--
}
export function end(item: Item, ctx: Context) {
	// We don't use game.dealDamage here
	// don't want player earn any score
	ctx.game.players.forEach(p => {
		if (p.identifier === ctx.player.identifier) {
			return
		}

		ctx.game.dealDamage(ctx.player, p, DAMAGE_AMOUNT)
	})
}
