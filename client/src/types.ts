export * from '~/protocol'
export type { PlayerPub } from '~/game'
export type { MapObject } from '~/maps'
export type { GameObject } from '~/game_objects'
export * from '~/round'

import { ClientMessage, ServerMessage, Identifier } from '@/types'

export type SendFunction = (message: ServerMessage) => void

declare global {
	interface Window {
		me: Identifier
		version: string
		// don't known how to pass argument to Phaser.Scene
		gameDom?: DocumentFragment
		gameEvents?: ClientMessage[]
	}
}
