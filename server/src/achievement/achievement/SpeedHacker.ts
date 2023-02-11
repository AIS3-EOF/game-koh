import { debug } from 'debug'
import { Achievement, AchievementType } from '../achievement'
import { Context } from '~/context'

import { Player } from '~/game'
import { MoveMessage, ServerMessage, Vec2 } from '~/protocol'
import { ChebyshevDistance } from '~/utils'

export class SpeedHacker extends Achievement {
	SCORE = 10

	constructor() {
		super(AchievementType.SpeedHacker)
	}

	updateProgress(ctx: Context, data: ServerMessage) {
		// If player is fully utilized the action count, then he is a speed hacker
		if (ctx.player.action_count > 1) return

		this.progress = this.maxProgress
		super.updateProgress(ctx, data)
	}
}
