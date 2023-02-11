import { debug } from 'debug'
import { Achievement, AchievementType } from '../achievement'
import { Context } from '~/context'

import { Player } from '~/game'
import { MoveMessage, ServerMessage, Vec2 } from '~/protocol'
import { ChebyshevDistance, add } from '~/utils'

export class Teleporter extends Achievement {
	SCORE = 10

	constructor() {
		super(AchievementType.Teleporter)
	}

	updateProgress(ctx: Context, data: ServerMessage) {
		if (data.type != 'move') return

		const new_pos = add(ctx.player.pos, data.data.vec)
		if (!ctx.game.map.canMoveTo(new_pos)) return

		if (ChebyshevDistance(new_pos, ctx.player.pos) > 15) {
			this.progress = this.maxProgress
			super.updateProgress(ctx, data)
		}
	}
}
