import { InteractMapMessageData } from '~/protocol'
import { Context } from '~/context'
import { MapObject } from '~/maps'

export const handle = async (ctx: Context, data: InteractMapMessageData) => {
    // Fix: validate the position
    const object = ctx.game.map.getTile(data.pos) as MapObject
    if (object) {
        object.interact(ctx, data.data)
        eventQueue.push({
            type: 'interact_map',
            data: {
                player: ctx.player,
                pos: data.pos
            }
        })
    }
}
