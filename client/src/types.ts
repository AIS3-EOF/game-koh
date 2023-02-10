export * from '~/protocol'
export type { PlayerPub } from '~/game'
export type { MapObject } from '~/maps'
export type { GameObject } from '~/game_objects'
export * from '~/round'

import GameMap from '@/resources/map'
import { ClientMessage, ServerMessage, Identifier } from '@/types'

export interface Team {
	identifier: Identifier
	name: string
}

declare global {
	interface Window {
		me: Identifier
		gameMap: GameMap
		events: ClientMessage[]
		send: (message: ServerMessage) => void
		version: string
	}
}
