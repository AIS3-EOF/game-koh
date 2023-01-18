import { Event } from './events'
import { EventEmitter } from 'events'

export class EventQueue extends EventEmitter {
	private events: Event[] = []

	push(event: Event) {
		this.events.push(event)
	}

	tick() {
		const events = this.events
		this.emit('tick', events)
		this.events = []
		return events
	}
}
