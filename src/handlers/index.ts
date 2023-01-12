import { ServerMessage, LoginMessageData, MoveMessageData } from '../protocol/server'
import { ClientMessage } from '../protocol/client'

export class Context {
	send(msg: ClientMessage) {}
}

export class Handler {
	handle(ctx: Context, msg: ServerMessage) {
		switch (msg.type) {
			case 'login':
				this.handle_login(ctx, msg.data)
				break
			case 'move':
				this.handle_move(ctx, msg.data)
				break
		}
	}
	handle_login(ctx: Context, data: LoginMessageData) {}
	handle_move(ctx: Context, data: MoveMessageData) {}
}
