import { ChatMessageData } from '~/protocol'
import { Context } from '~/context'
import parser from '~/parser'

export const handle = async (ctx: Context, data: ChatMessageData) => {
	const { /*from,*/ to } = data
	const from = ctx.player.identifier
	const ServerMessage = (message: string) => ({
		timestamp: Date.now(),
		from: '(server)' as '(server)',
		to: from,
		message,
	})

	const messageData = { ...data, timestamp: Date.now(), from }

	// if (to === from)
	// 	return ctx.send({
	// 		type: 'chat',
	// 		data: ServerMessage("Can't send message to yourself")
	// 	})

	if (to === '(all)') {
		eventQueue.push({
			type: 'chat',
			data: messageData,
		})
	} else {
		if (to === '(server)' || !sockets.has(to))
			return ctx.send({
				type: 'chat',
				data: ServerMessage('Player not found'),
			})
		sockets.send(to,
			parser.stringify({
				type: 'chat',
				data: messageData,
			}),
		)
	}
}
