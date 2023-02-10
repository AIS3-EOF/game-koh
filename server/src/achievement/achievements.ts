import { debug } from 'debug'

import { Player } from '~/game'
import { ServerMessage } from '~/protocol'
import { Context } from '~/context'

import { AchievementType, Achievement } from './achievement'

// import { Experienced } from './archievements/Experienced'
import { Teleporter } from './achievement/Teleporter'
import { AFR } from './achievement/AFR'
import { SpeedHacker } from './achievement/SpeedHacker'

const log = debug('server:Achievement:log')

export class Achievements {
	private achievements = new Map<AchievementType, Achievement>([
		[AchievementType.Teleporter, new Teleporter()],
		[AchievementType.AFR, new AFR()],
		[AchievementType.SpeedHacker, new SpeedHacker()],
	])

	constructor() {}

	update(ctx: Context, msg: ServerMessage) {
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
		return Array.from(this.achievements.values()).filter(
			el => el.isCompleted,
		)
	}

	save() {
		return Array.from(this.achievements.entries()).reduce(
			(obj, [type, achievement]) => ({
				...obj,
				[type]: achievement.save(),
			}),
			{} as Record<AchievementType, ReturnType<Achievement['save']>>,
		)
	}

	load(data: ReturnType<Achievements['save']>) {
		Object.entries(data).forEach(([type, item]) => {
			const achievement = this.achievements.get(type as AchievementType)
			if (achievement && item) achievement.load(item)
		})
	}
}
