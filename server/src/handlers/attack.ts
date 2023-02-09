import { AttackMessageData } from '~/protocol'
import { AttackTarget } from '~/protocol'
import { Context } from '~/context'
import { normalize } from '~/utils'


export const handle = async (ctx: Context, data: AttackMessageData) => {
	const { player: attacker } = ctx

	attacker.facing = data.facing
	let sideEffect = 0
	const targets = [] as AttackTarget[]
	for (const target of ctx.game.players.values()) {
		// ignore if the target isn't alive
		if (target === attacker || !target.alive) {
			continue
		}

		const { damage, effect } = attacker.current_weapon.calc(
			attacker,
			target,
		)

		if (damage <= 0) {
			continue
		}

		// dealing damage to victims
		ctx.game.dealDamage(attacker, target, damage)
		sideEffect += effect
		targets.push({
			identifier: target.identifier,
			damage,
		})

		// Ticking the weapon effect if needed
		if (attacker.current_weapon.detail.tick) {
			eventQueue.manage('tick_object', {
				identifier: attacker.current_weapon.identifier,
				tick_count: attacker.current_weapon.tick_count,
				tick_fn: (tick: number) => { attacker.current_weapon.tick(ctx, target, tick) }
			})
		}

		ctx.player.exp += damage

		// Scoring system moved under game.ts
	}

	attacker.current_weapon.detail.hit?.(ctx)
	if (sideEffect) {
		ctx.game.dealDamage(attacker, attacker, sideEffect)
		targets.push({
			identifier: attacker.identifier,
			damage: sideEffect,
		})
	}

	eventQueue.push({
		type: 'attack',
		data: {
			attacker: attacker.identifier,
			attacker_pos: attacker.pos,
			targets,
		},
	})
}
