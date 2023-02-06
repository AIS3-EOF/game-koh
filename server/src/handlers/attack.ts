import { AttackMessageData } from '@/protocol'
import { AttackTarget } from '@/protocol'
import { Context } from '@/context'
import { normalize } from '@/utils'

export const handle = async (ctx: Context, data: AttackMessageData) => {
    const { player: attacker } = ctx
    attacker.facing = data.facing
    let sideEffect = 0
    const targets = [] as AttackTarget[]
    for (const target of ctx.game.players) {
        if (target === attacker) continue
        const { damage, effect } = attacker.current_weapon.calc(attacker, target)
        if (damage > 0) {
            target.hp -= damage
            sideEffect += effect
            targets.push({
                identifier: target.identifier,
                damage,
            })
        }
    }
    attacker.current_weapon.detail.hit?.(ctx)
    ctx.eventQueue.push({
        type: 'attack',
        data: {
            attacker: attacker.identifier,
            attacker_pos: attacker.pos,
            targets,
        }
    })
    if (sideEffect) {
        attacker.hp -= sideEffect
        ctx.eventQueue.push({
            type: 'attack',
            data: {
                attacker: attacker.identifier,
                attacker_pos: attacker.pos,
                targets: [{
                    identifier: attacker.identifier,
                    damage: sideEffect,
                }]
            }
        })
    }
}
