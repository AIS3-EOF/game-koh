import { UseMessageData } from '../protocol/server'
import { Context } from '../context'

export const handle = async (ctx: Context, data: UseMessageData) => {
    const object = ctx.getObject(data.uuid)
    if (!object) return ctx.sendError('No such object')
    if (data.event) {
        object.useEvent(ctx, data.event)
    } else {
        object.use(ctx)
        ctx.eventQueue.push({
            type: 'use',
            data: {
                player: ctx.player,
                object,
            },
        })
    }
}
