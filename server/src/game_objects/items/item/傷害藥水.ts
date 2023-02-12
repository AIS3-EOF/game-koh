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

const ATK_AMOUNT = 10

export const identifier = '傷害藥水'
export const texture = 'strength_potion'
export const description = '使用後立刻獲得 10 攻擊加成'
export function use(item: Item, ctx: Context) {
    ctx.player.atk += ATK_AMOUNT
}

export const total_tick = 0
export function tick(item: Item, ctx: Context) {

}
export function end(item: Item, ctx: Context) {

}
