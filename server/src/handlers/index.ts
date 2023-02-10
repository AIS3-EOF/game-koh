import { ServerMessage, ServerType } from '~/protocol'
import { Context } from '~/context'
import { Player } from '~/game'
import { AFRType } from '~/config'
import { handle as handle_move } from './move'
import { handle as handle_attack } from './attack'
import { handle as handle_use } from './use'
import { handle as handle_chat } from './chat'
import { handle as handle_interact_map } from './interact_map'
import { handle as handle_afr } from './afr'

import { debug } from 'debug'

const log = debug('server:handlers:log')
const warn = debug('server:handlers:warn')
const error = debug('server:handlers:error')

const HANDLERS = new Map<
	ServerType,
	null | ((ctx: Context, data: any) => void)
>([
	['login', null],
	['move', handle_move],
	['attack', handle_attack],
	['use', handle_use],
	['interact_map', handle_interact_map],
	['chat', handle_chat],
	[AFRType, handle_afr],
])

export const dispatch = async (ctx: Context, msg: ServerMessage) => {
	if (!ctx.player.alive || ctx.player.action_count < 0) return
	ctx.player.action_count--

	const fn = HANDLERS.get(msg.type)
	if (typeof fn === 'function') {
		// idk how to fix this without hack
		try {
			await fn(ctx, msg.data)
		} catch (e) {
			console.error(e)
		}

		// achievement progression
		ctx.player.achievements.update(ctx, msg)

		// Moved to roundTick, because now items can kill players
		// check death player and despawn them for certain time
		// eventQueue.manage('check_death')
	}
}
