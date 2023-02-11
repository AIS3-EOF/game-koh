import { ServerMessage } from '~/protocol'
import { Context } from '~/context'
import { AFRType } from '~/config'
import { Achievement, AchievementType } from '../achievement'

export class Lucky extends Achievement {
	SCORE = 10

	constructor() {
		super(AchievementType.Lucky)
	}

	updateProgress(ctx: Context, data: ServerMessage) {
		const hasRareItem = [...ctx.player.inventory.values()].some(
			item => item.is_rare,
		)
		if (hasRareItem) {
			this.progress = this.maxProgress
			super.updateProgress(ctx, data)
		}
	}
}
