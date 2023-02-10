import { ChatMessageData, ClientMessage } from '~/protocol'
import { Context } from '~/context'

export const handle = async (ctx: Context, data: ChatMessageData) => {
	const { /*from,*/ to } = data
	const from = ctx.player.identifier
	const ServerMessage = (message: string) => ({
		timestamp: Date.now(),
		from: '(server)' as '(server)',
		to: from,
		message,
	})

	const messageData: ClientMessage = {
		type: 'chat',
		data: { ...data, timestamp: Date.now(), from },
	}

	// if (to === from)
	// 	return ctx.send({
	// 		type: 'chat',
	// 		data: ServerMessage("Can't send message to yourself")
	// 	})

	if (to === '(all)') {
		eventQueue.push(messageData)
	} else {
		if (to === '(server)' || !sockets.has(to))
			return ctx.send({
				type: 'chat',
				data: ServerMessage('Player not found'),
			})
		sockets.send(to, messageData)
	}
}
