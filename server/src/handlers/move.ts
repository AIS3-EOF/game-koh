import { MoveMessageData } from '~/protocol'
import { Context } from '~/context'
import { add } from '~/utils'
import { MOVE_SCORE } from '~/config'

export const handle = async (ctx: Context, data: MoveMessageData) => {
    let moved: boolean = false
    const newPos = add(ctx.player.pos, data.vec)

    if (ctx.game.map.canMoveTo(newPos)) {
        ctx.player.pos = newPos
        ctx.player.facing = data.facing
        moved = true
    } else if (ctx.player.facing != data.facing){
        ctx.player.facing = data.facing
        moved = true
    }

    if (moved) {
        ctx.addScore(MOVE_SCORE)
        ctx.eventQueue.push({
            type: 'move',
            data: {
                identifier: ctx.player.identifier,
                facing: ctx.player.facing,
                pos: ctx.player.pos,
            }
        })
    }
}
