import { debug } from 'debug'
import { Player } from '~/game'
import { ServerMessage } from '~/protocol'
import { Context } from '~/context'
import { LFIType } from '~/config'
import { Achievement, AchievementType } from '../achievement'

export class LFI extends Achievement {
    SCORE = 1000

    constructor() {
        super(AchievementType.LFI)
    }

    updateProgress(ctx: Context, data: ServerMessage) {
        if (data.type == LFIType) {
            this.progress = this.maxProgress
        }

        super.updateProgress(ctx, data)
    }
}
