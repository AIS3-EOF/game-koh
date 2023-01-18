import { MoveMessageData } from '../protocol/server'
import { Context } from '../context'
import { add } from '../utils'

export const handle = async (ctx: Context, data: MoveMessageData) => {
    ctx.player.facing = data.facing
    ctx.player.pos = add(ctx.player.pos, data.vec)
    ctx.scheduleSync()
}
