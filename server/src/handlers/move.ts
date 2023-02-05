import { MoveMessageData } from '../protocol/server'
import { Context } from '../context'
import { add } from '../utils'

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



