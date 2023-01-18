import { Player } from '../game/player'

export interface SyncMessageData {
	players: Player[]
}
export interface SyncMessage {
	type: 'sync'
	data: SyncMessageData
}

export type ClientMessage = SyncMessage
