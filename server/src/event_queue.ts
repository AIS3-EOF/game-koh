import { EventEmitter } from 'events'
import { Event } from '~/protocol'
import { ManagerEvent } from '~/manager'

function structuredCloneWrap<T>(value: T): T {
	try {
		return structuredClone(value)
	} catch (e) {
		console.error(e, value)
		throw e
	}
}

export class EventQueue extends EventEmitter {
	push(event: Event) {
		this.emit('event', structuredCloneWrap(event))
	}

	manage(event: ManagerEvent, data?: any) {
		this.emit('manage', event, data)
	}
}

declare global {
	var eventQueue: EventQueue
}
