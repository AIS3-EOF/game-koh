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

const MAXHP_AMOUNT = 50

export const identifier = '成長藥水'
export const texture = 'grow_potion'
export const description = '使用後立刻獲得 50 MaxHP'
export function use(item: Item, ctx: Context) {
    ctx.player.addMaxHp(MAXHP_AMOUNT)
}

export const total_tick = 0
export function tick(item: Item, ctx: Context) {

}
export function end(item: Item, ctx: Context) {

}
