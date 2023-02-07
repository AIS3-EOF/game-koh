export * from '~/protocol'
export type { Player } from '~/game'
export type { MapObject } from '~/maps'
export type { GameObject } from '~/game_objects'
export * from '~/manager.d'

import GameMap from '@/resources/map'
import { ClientMessage, ServerMessage } from '@/types'

declare global {
	interface Window {
		me: string
		gameMap: GameMap
		events: ClientMessage[]
		send: (message: ServerMessage) => void
	}
}
