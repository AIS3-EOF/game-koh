import { MoveMessageData, Vec2 } from '~/protocol'
import { Context } from '~/context'
import { add, isVec2 } from '~/utils'
import { MOVE_SCORE } from '~/config'

export const handle = async (ctx: Context, data: MoveMessageData) => {
	if (!isVec2(data.vec) || !isVec2(data.facing)) {
		return
	}

	let moved: boolean = false
	const newPos = add(ctx.player.pos, data.vec)

	if (ctx.game.map.canMoveTo(newPos)) {
		ctx.player.pos = newPos
		ctx.player.facing = data.facing
		moved = true
	} else if (ctx.player.facing != data.facing) {
		ctx.player.facing = data.facing
		moved = true
	}

	if (moved) {
		ctx.addScore(MOVE_SCORE)
		ctx.player.exp += MOVE_SCORE
		eventQueue.push({
			type: 'move',
			data: {
				identifier: ctx.player.identifier,
				facing: ctx.player.facing,
				pos: ctx.player.pos,
			},
		})
	}
}
