import { EventEmitter } from 'events'
import { Event } from '~/protocol'
import { ManagerEvent } from '~/round'
import { WebSocket } from 'ws'

export class EventQueue extends EventEmitter {
	push(event: Event) {
		this.emit('event', structuredClone(event))
	}

	manage(event: ManagerEvent) {
		this.emit('manage', structuredClone(event))
	}
}

declare global {
	var eventQueue: EventQueue
	var sockets: Map<string, WebSocket>
}
