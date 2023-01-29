import { AttackMessageData } from '../protocol/server'
import { Context } from '../context'
import { normalize } from '../utils'

export const handle = async (ctx: Context, data: AttackMessageData) => {
    const { player: attacker } = ctx
    attacker.facing = data.facing
    let sideEffect = 0
    for (const target of ctx.game.players) {
        const { damage, effect } = attacker.current_weapon.calc(attacker, target)
        if (damage > 0) {
            target.hp -= damage
            sideEffect += effect
            ctx.eventQueue.push({
                type: 'attack',
                data: {
                    attacker,
                    target,
                    damage,
                }
            })
        }
    }
    if (sideEffect) {
        attacker.hp -= sideEffect
        ctx.eventQueue.push({
            type: 'attack',
            data: {
                attacker,
                target: attacker,
                damage: sideEffect,
            }
        })
    }
}
