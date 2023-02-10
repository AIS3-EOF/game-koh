import { debug } from 'debug'

import { Player } from '~/game/player'
import { ServerMessage } from '~/protocol'
import { Context } from '~/context'

const log = debug('server:Achievement')

export enum AchievementType {
	'散財童子' = '散財童子',
	'敗家子' = '敗家子',
	'兩萬五千里長征' = '兩萬五千里長征',
	'槍王之王' = '槍王之王',
	'How_did_we_get_there' = 'How did we get here?',
	'經驗值' = '經驗值',
	'AFR' = 'AFR',
	'konami code' = 'konami code',
	'Front-End hardcoded' = 'Front-End hardcoded',
	'佐藤和真' = '佐藤和真',
	'360_no_scope' = '360 no scope',
	'Game_Controller' = 'Game Controller',
	'走路不看路' = '走路不看路',
	'Teleporter' = 'Teleporter',
	'SpeedHacker' = 'Speed Hacker',
}

export class Achievement {
	SCORE = 0

	// Ranging from 0 to 100
	progress: number = 0
	maxProgress: number = 100
	rewarded = false

	complete_time: number = 0

	constructor(public type: AchievementType) {
		this.rewarded = false
	}

	get isCompleted() {
		return this.progress >= this.maxProgress
	}

	// Update achievement progess and reward players who complete the achievement
	updateProgress(ctx: Context, data: ServerMessage) {
		if (this.rewarded) {
			return
		}

		if (this.isCompleted && !this.rewarded) {
			this.reward(ctx)
			return
		}

		log(
			`Updating ${ctx.player.identifier}'s progress for achievement: ${this.type}`,
		)
	}

	reward(ctx: Context) {
		if (this.rewarded) {
			return
		}

		log(`Rewarding ${ctx.player.identifier} for achievement: ${this.type}`)
		this.complete_time = Date.now()
		this.rewarded = true
		ctx.addScore(this.SCORE)

		eventQueue.push({
			type: 'achievement',
			data: {
				player: ctx.player.dump(),
				achievement: this,
			},
		})
	}

	save() {
		return {
			complete_time: this.complete_time,
			progress: this.progress,
			rewarded: this.rewarded,
		}
	}

	load(data: ReturnType<Achievement['save']>) {
		this.complete_time = data.complete_time
		this.progress = data.progress
		this.rewarded = data.rewarded
	}
}
