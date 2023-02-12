import { io } from 'socket.io-client'
import { debug } from 'debug'
import { Events } from '~/protocol'

const warn = debug('server:visualizer:warn')
const log = debug('server:visualizer:log')
const verbose = debug('server:visualizer:debug')

export async function visualizer() {
	const { VISUALIZER_URL } = process.env
	if (!VISUALIZER_URL) {
		warn('no visualizer url set, skipping')
		return
	}

	const socket = io(VISUALIZER_URL)

	log('connecting to visualizer...')
	await new Promise(resolve => socket.once('connect', resolve as any))
	log('connected to visualizer')

	function send(type: string, data: any) {
		verbose('sending %s %o', type, data)
		socket.emit(type, data)
	}

	eventQueue.on('event', ({ type, data }: Events) => {
		switch (type) {
			case 'attack':
				if (!data.targets.length) {
					send('gamedamage', [[data.attacker, -1]])
				} else {
					send(
						'gamedamage',
						data.targets.map(target => [
							data.attacker,
							target.identifier,
						]),
					)
				}
				break
			case 'death':
				send('gamekill', [
					[data.attacker_identifier, data.victim_identifier],
				])
				break
		}
	})
}
