import { Event } from './protocol/events'
import { EventEmitter } from 'events'

export class EventQueue extends EventEmitter {
	push(event: Event) {
		this.emit('event', structuredClone(event))
	}
}
