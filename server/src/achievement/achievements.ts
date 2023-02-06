import { debug } from 'debug'

import { Player } from "~/game"
import { ServerMessage } from '~/protocol'
import { Context } from '~/context'

import { AchievementType, Achievement } from './achievement'

const log = debug('server:Achievement');

export class Achievements {
    private map = new Map<AchievementType, Achievement>();

    constructor() {}

    update(ctx: Context, msg: ServerMessage) {
        // if (msg.type == LFItype)
    }

    toJSON() {
        return Array.from(this.map.values())
    }
}
