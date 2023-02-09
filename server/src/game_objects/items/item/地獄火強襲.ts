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

const DAMAGE_AMOUNT = 8

export const identifier = '地獄火強襲'
export const texture = 'dynamite'
export const description = '呼叫地獄火戰機進行全面掃蕩，對所有地面玩家造成些許傷害（包括你自己）'
export function use(item: Item, ctx: Context) {
    ctx.game.players.forEach((p) => {
        p.dealDamageFrom(DAMAGE_AMOUNT, ctx.player.identifier)
    })
}

export const total_tick = 0
export function tick(item: Item, ctx: Context) {

}
export function end(item: Item, ctx: Context) {

}
