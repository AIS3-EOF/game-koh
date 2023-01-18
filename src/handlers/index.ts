import { ServerMessage } from '../protocol/server'
import { Context } from '../context'
import { handle as handle_move } from './move'

const HANDLERS = {
	login: null,
	move: handle_move
}
Object.setPrototypeOf(HANDLERS, null)

export const dispatch = async (ctx: Context, msg: ServerMessage) => {
	const fn = HANDLERS[msg.type]
	if (typeof fn === 'function') {
		// idk how to fix this without hack
		await fn(ctx, msg.data as any)
	}
}
