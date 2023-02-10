import { ChatMessageData, ClientMessage, Identifier } from '~/protocol'
import { Context } from '~/context'
import { CHAT_COOLDOWN } from '~/config'

const chatmap = new Map<Identifier, number>()

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

	const last_chat = chatmap.get(from)
	if (last_chat && Date.now() - last_chat < CHAT_COOLDOWN)
		return ctx.send({
			type: 'chat',
			data: ServerMessage('Chat cooldown'),
		})
	chatmap.set(from, Date.now())

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
