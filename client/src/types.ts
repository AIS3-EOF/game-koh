export * from '~/protocol'
export * from '~/game'
export * from '~/maps'
export * from '~/game_objects'

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