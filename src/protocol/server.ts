import { Vec2 } from './shared'

export interface LoginMessageData {
	token: string
}
export interface LoginMessage {
	type: 'login'
	data: LoginMessageData
}

export interface MoveMessageData {
	vec: Vec2
	facing: Vec2
}
export interface MoveMessage {
	type: 'move'
	data: MoveMessageData
}

export type ServerMessage = LoginMessage | MoveMessage
