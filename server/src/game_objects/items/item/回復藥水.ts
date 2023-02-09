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

const HEAL_AMOUNT = 10

export const identifier = '回復藥水'
export const texture = 'recovery_potion'
export const description = '使用後立刻獲得 10HP'
export function use(item: Item, ctx: Context) {
    ctx.player.heal(HEAL_AMOUNT)
}

export const total_tick = 0
export const used_tick = 0
export function tick(item: Item, ctx: Context) {

}

export function end(item: Item, ctx: Context) {

}
