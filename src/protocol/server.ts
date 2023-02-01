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

export interface AttackMessageData {
	facing: Vec2
}
export interface AttackMessage {
	type: 'attack'
	data: AttackMessageData
}

export interface UseMessageData {
	uuid: string
	event?: string
}
export interface UseMessage {
	type: 'use'
	data: UseMessageData
}

export interface InteractMapMessageData {
	pos: Vec2
}
export interface InteractMapMessage {
	type: 'interact_map'
	data: InteractMapMessageData
}

export interface ChatMessageData {
	from: string
	to: string
	message?: string
	html?: string
}
export interface ChatMessage {
	type: 'chat'
	data: ChatMessageData
}

export type ServerMessage = LoginMessage | MoveMessage | AttackMessage | UseMessage | ChatMessage | InteractMapMessage
