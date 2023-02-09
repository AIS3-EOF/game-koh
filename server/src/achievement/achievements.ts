import { debug } from 'debug'

import { Player } from '~/game'
import { ServerMessage } from '~/protocol'
import { Context } from '~/context'

import { AchievementType, Achievement } from './achievement'

import { Experienced } from './archievements/經驗值'

const log = debug('server:Achievement')

export class Achievements {
	private achievements = new Map<AchievementType, Achievement>([
		[AchievementType.經驗值, new Experienced()]
	])

	constructor() { }

	update(ctx: Context, msg: ServerMessage) {
		// if (msg.type == LFItype)
		this.achievements.forEach((achievement: Achievement) => {
			achievement.updateProgress(ctx, msg)
		})
	}

	resetReward() {
		this.achievements.forEach((achievement: Achievement) => {
			achievement.rewarded = false
		})
	}

	dump() {
		return Array.from(this.achievements.values())
	}
}
