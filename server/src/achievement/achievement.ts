import { debug } from 'debug'

import { Player } from "~/game/player";
import { ServerMessage } from '~/protocol'

const log = debug('server:Achievement');

export enum AchievementType {
    '散財童子' = '散財童子',
    '敗家子' = '敗家子',
    '兩萬五千里長征' = '兩萬五千里長征',
    '槍王之王' = '槍王之王',
    'How_did_we_get_there' = 'How did we get here?',
    '經驗值' = '經驗值',
    'LFI' = 'LFI',
    'konami code' = 'konami code',
    'Front-End hardcoded' = 'Front-End hardcoded',
    '佐藤和真' = '佐藤和真',
    '360_no_scope' = '360 no scope',
    'Game_Controller' = 'Game Controller',
    '走路不看路' = '走路不看路',
}

export class Achievement {
    constructor(
        public type: AchievementType,
    ) {}

    // Ranging from 0 to 100
    progress: number = 0;
    maxProgress: number = 100;

    get isCompleted() {
        return this.progress >= this.maxProgress;
    }

    updateProgress(player: Player, data: ServerMessage) {
        log(`Updating progress for achievement: ${this.type}`);
    }

    reward(player: Player) {
        log(`Rewarding player for achievement: ${this.type}`);
    }
}
