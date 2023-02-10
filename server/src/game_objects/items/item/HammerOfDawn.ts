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
import { ChebyshevDistance } from '~/utils'

const DAMAGE_AMOUNT = 10

export const identifier = '黎明之鎚雷射定位裝置'
export const texture = 'hammer_of_dawn'
export const description = '有幾個軌道武器從戰爭機器的宇宙飄進這了，你還很剛好撿到這個定位裝置！'
export function use(item: Item, ctx: Context) {
    item.extra_data = 5
}

export const total_tick = 5
export function tick(item: Item, ctx: Context) {
    eventQueue.push({
        type: 'chat',
        data: {
            from: '(server)',
            to: '(all)',
            message: `黎明之鎚轟炸倒數 ${item.extra_data}...`,
        },
    })
    item.extra_data--
}
export function end(item: Item, ctx: Context) {
    // We don't use game.dealDamage here
    // don't want player earn any score
    ctx.game.players.forEach((p) => {
        if (ChebyshevDistance(ctx.player.pos, p.pos) < 5) {
            ctx.game.dealDamage(ctx.player, p, DAMAGE_AMOUNT)
        }

        eventQueue.push({
            type: 'chat',
            data: {
                from: '(server)',
                to: p.identifier,
                message: `你被黎明之鎚轟炸了`,
            },
        })
    })
}
