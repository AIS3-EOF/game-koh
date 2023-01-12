export interface SyncMessageData {}
export interface SyncMessage {
	type: 'sync'
	data: SyncMessageData
}

export type ClientMessage = SyncMessage
