import { ServerMessage } from '../protocol/server'
import { Context } from '../context'
import { handle as handle_move } from './move'
import { handle as handle_attack } from './attack'
import { handle as handle_use } from './use'
import { handle as handle_chat } from './chat'

const HANDLERS = new Map<string, null | ((ctx: Context, data: any) => void)>([
	['login', null],
	['move', handle_move],
	['attack', handle_attack],
	['use', handle_use],
	['chat', handle_chat],
])

export const dispatch = async (ctx: Context, msg: ServerMessage) => {
	if (ctx.player.action_count <= 0) return
	ctx.player.action_count--
	const fn = HANDLERS.get(msg.type)
	if (typeof fn === 'function') {
		// idk how to fix this without hack
		await fn(ctx, msg.data)
	}
}
