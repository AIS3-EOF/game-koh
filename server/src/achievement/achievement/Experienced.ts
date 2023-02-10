import { debug } from 'debug'
import { Player } from '~/game'
import { ServerMessage } from '~/protocol'
import { Context } from '~/context'
import { Achievement, AchievementType } from '../achievement'


export class Experienced extends Achievement {
	SCORE = 10
	EXP_THRESHOLD = 1000000

	constructor() {
		super(AchievementType.經驗值)
	}

	updateProgress(ctx: Context, data: ServerMessage) {
		if (ctx.player.exp >= this.EXP_THRESHOLD) {
			this.progress = this.maxProgress
		} else {
			this.progress = (ctx.player.exp / this.EXP_THRESHOLD) * 100
		}

		super.updateProgress(ctx, data)
	}
}
