import { Achievement, AchievementType } from "../achievement"
import { Player } from "@/game/player";
import { ServerMessage } from '@/protocol/server'
import { debug } from 'debug'


export class Experienced extends Achievement {
    EXP_THRESHOLD = 1000;

    constructor() {
        super(AchievementType.經驗值);
    }

    updateProgress(player: Player, data: ServerMessage) {
        super.updateProgress(player, data);

        if (!this.isCompleted && player.exp >= this.EXP_THRESHOLD) { 
            this.progress = this.maxProgress;
            this.setCompleted();
            this.reward(player);
        } else if (player.exp < this.EXP_THRESHOLD) {
            this.progress = player.exp / this.EXP_THRESHOLD * 100;
        }
    }

    reward(player: Player) {
        super.reward(player);

        // TODO: reward player
    }
}