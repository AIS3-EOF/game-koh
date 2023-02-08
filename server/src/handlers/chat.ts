import { ChatMessageData } from '~/protocol'
import { Context } from '~/context'
import parser from '~/parser'

export const handle = async (ctx: Context, data: ChatMessageData) => {
	const { from, to, message } = data
	const ServerMessage = (message: string) => ({
		timestamp: Date.now(),
		from: '(server)',
		to: from,
		message,
	})

	const messageData = { timestamp: Date.now(), from, to, message }

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
		if (!sockets.has(to))
			return ctx.send({
				type: 'chat',
				data: ServerMessage('Player not found'),
			})
		sockets.get(to)?.send(
			parser.stringify({
				type: 'chat',
				data: messageData,
			}),
		)
	}
}
