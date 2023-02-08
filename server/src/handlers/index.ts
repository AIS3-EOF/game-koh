import { ServerMessage } from '~/protocol'
import { Context } from '~/context'
import { handle as handle_move } from './move'
import { handle as handle_attack } from './attack'
import { handle as handle_use } from './use'
import { handle as handle_chat } from './chat'
import { handle as handle_interact_map } from './interact_map'
import { Player } from '~/game'

const HANDLERS = new Map<string, null | ((ctx: Context, data: any) => void)>([
	['login', null],
	['move', handle_move],
	['attack', handle_attack],
	['use', handle_use],
	['chat', handle_chat],
	['interact_map', handle_interact_map],
])

export const dispatch = async (ctx: Context, msg: ServerMessage) => {
	if (!ctx.player.alive || ctx.player.action_count <= 0) return
	ctx.player.action_count--

	const fn = HANDLERS.get(msg.type)
	if (typeof fn === 'function') {
		// idk how to fix this without hack
		await fn(ctx, msg.data)

		// achievement progression
		ctx.player.achievements.update(ctx, msg)

		// check death player and despawn them for certain time
		eventQueue.manage('check_death')
	}
}
