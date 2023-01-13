import { ServerMessage, LoginMessageData, MoveMessageData } from '../protocol/server'
import { Context } from '../context'

export class Handler {
	handle(ctx: Context, msg: ServerMessage) {
		const fn = this[`handle_${msg.type}`]
		if (typeof fn === 'function') {
			// idk how to fix this without hack
			;(fn as any).call(this, ctx, msg.data)
		}
	}
	handle_login(ctx: Context, data: LoginMessageData) {}
	handle_move(ctx: Context, data: MoveMessageData) {}
}
