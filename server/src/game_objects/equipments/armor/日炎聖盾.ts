import { Player } from '~/game'
import { Context } from '~/context'
import { calcDistance, ChebyshevDistance } from '~/utils'
import { AttackTarget, Vec2 } from '~/protocol'

import { DAMAGE_SCORE } from '~/config'

const DAMAGE_AMOUNT = 1

export const identifier = '日炎聖盾'
export const texture = 'sunshine_shield'
export const can_transfer = true
export const description = '讓太陽的力量籠罩你吧！灼燒周圍的一切！！'
export const defense_modifier = 2

export function equip(player: Player) {
}

export function unequip(player: Player) {
}

export function tick(ctx: Context) {
    const R = 2
    const W = R * 2 + 1
    const range: Vec2[] = Array.from({ length: W })
        .map((_, i) =>
            Array.from({ length: W }).map((_, j) => {
                return [i - R, j - R] as Vec2
            }),
        )
        .reduce((a, b) => a.concat(b), [])
        .filter(([x, y]) => x || y)

    ctx.game.players.forEach((p) => {
        if (p == ctx.player) return

        const dv = calcDistance(ctx.player.pos, p.pos, p.facing)
        const inside = range.some(rv => ChebyshevDistance(dv, rv) <= 0.5)
        if (inside) {
            ctx.game.dealDamage(ctx.player, p, DAMAGE_AMOUNT)
            eventQueue.push({
                type: 'chat',
                data: {
                    from: '(server)',
                    to: p.identifier,
                    message: '[敵人的日炎聖盾] 你覺得太熱了：-1 HP',
                },
            })
        }
    })
}

