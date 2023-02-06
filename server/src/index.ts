import { WebSocket } from 'ws'
import { debug } from 'debug'
import parser from '~/parser'
import { Manager } from '~/manager'

const log = debug('server:main')

const manager = new Manager()

// if (require.main === module) {
	const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
	;(async () => {
		await sleep(1000)
		const ws = new WebSocket('ws://localhost:8080')
		ws.on('open', async () => {
			ws.send(
				parser.stringify({
					type: 'login',
					data: {
						token: 'test'
					}
				})
			)
			await sleep(1000)
			ws.send(parser.stringify({ type: 'move', data: { facing: [1, 0], vec: [1, 0] } }))
			await sleep(3000)
			// ws.close()
		})
		const log = debug('client:message')
		ws.on('message', data => {
			console.log(new Date().toLocaleString(), parser.parse(data.toString()))
		})
	})()
// }
