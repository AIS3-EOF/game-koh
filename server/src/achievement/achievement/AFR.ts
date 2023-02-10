import { ServerMessage } from '~/protocol'
import { Context } from '~/context'
import { AFRType } from '~/config'
import { Achievement, AchievementType } from '../achievement'

export class AFR extends Achievement {
	SCORE = 10

	constructor() {
		super(AchievementType.AFR)
	}

	updateProgress(ctx: Context, data: ServerMessage) {
		if (process.env.RELEASE_SOURCE) return
		if (data.type == AFRType && data.data.path !== '../package.json') {
			this.progress = this.maxProgress
			super.updateProgress(ctx, data)
		}
	}
}
