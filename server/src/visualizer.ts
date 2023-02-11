import { io } from 'socket.io-client'
import { debug } from 'debug'
import { Events } from '~/protocol'

const log = debug('server:visualizer:log')

export async function visualizer() {
	const socket = io('http://10.140.0.4:8887')

	log('connecting to visualizer...')
	await new Promise(resolve => socket.once('connect', resolve as any))
	log('connected to visualizer')

	eventQueue.on('event', (event: Events) => {})
}
