import { ServerMessage } from '@/protocol/server'
import { Context } from '@/context'
import { normalize } from '@/utils'

export const handle = async (ctx: Context, data: ServerMessage) => {
    for (const achievement of ctx.player.achievements) {
        achievement.updateProgress(ctx.player, data)
    }

}
