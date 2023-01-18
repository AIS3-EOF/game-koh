import { Player } from '../game/player'
import { Event } from '../events'

export interface SyncMessageData {
	players: Player[]
	events: Event[]
}
export interface SyncMessage {
	type: 'sync'
	data: SyncMessageData
}

export type ClientMessage = SyncMessage
