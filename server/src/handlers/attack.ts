import { AttackMessageData } from '~/protocol'
import { AttackTarget } from '~/protocol'
import { Context } from '~/context'
import { normalize } from '~/utils'
import { DAMAGE_SCORE, KILL_SCORE } from '~/config'

export const handle = async (ctx: Context, data: AttackMessageData) => {
    const { player: attacker } = ctx
    attacker.facing = data.facing
    let sideEffect = 0
    const targets = [] as AttackTarget[]
    for (const target of ctx.game.players) {
        if (target === attacker) {
            continue
        }

        const { damage, effect } = attacker.current_weapon.calc(attacker, target)
        if (damage <= 0) {
            continue
        }

        // dealing damage to victims
        target.hp -= damage
        sideEffect += effect
        targets.push({
            identifier: target.identifier,
            damage,
        })

        // update the last damage
        target.last_damage_from = attacker.identifier

        // add attack bonus
        ctx.addScore(DAMAGE_SCORE)

        // if the damage kill the victim, give attack KILL_SCORE
        if (target.hp <= 0) {
            ctx.addScore(KILL_SCORE)
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
        attacker.last_damage_from = attacker.identifier
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
