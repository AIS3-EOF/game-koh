import { EventEmitter } from 'events'

import { Event } from '@/protocol/events'

export class EventQueue extends EventEmitter {
	push(event: Event) {
		this.emit('event', structuredClone(event))
	}
}
