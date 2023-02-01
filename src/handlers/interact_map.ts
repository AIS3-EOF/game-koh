import { InteractMapMessageData } from '../protocol/server'
import { Context } from '../context'

export const handle = async (ctx: Context, data: InteractMapMessageData) => {
    // vulnerable code. Fix: validate the position
    ctx.game.map.getTile(data.pos).interact(ctx);

    ctx.eventQueue.push({
        type: 'interact_map',
        data: {
            player: ctx.player,
            pos: data.pos
    }});
}

