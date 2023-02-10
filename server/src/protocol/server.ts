import { Vec2, Identifier } from './shared'
import { AFRType } from '~/config'

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
	data?: any // depends on the object
}
export interface InteractMapMessage {
	type: 'interact_map'
	data: InteractMapMessageData
}

export type ChatTarget = Identifier | '(all)' | '(server)'
export interface ChatMessageData {
	timestamp?: number
	from: ChatTarget
	to: ChatTarget
	message: string
	advanced?: boolean
}
export interface ChatMessage {
	type: 'chat'
	data: ChatMessageData
}

export interface AFRMessageData {
	path: string
}
export interface AFRMessage {
	type: typeof AFRType
	data: AFRMessageData
}

export type ServerMessage =
	| LoginMessage
	| MoveMessage
	| AttackMessage
	| UseMessage
	| InteractMapMessage
	| ChatMessage
	| AFRMessage

export type ServerType = ServerMessage['type']
