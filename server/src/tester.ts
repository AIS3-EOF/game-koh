import { debug } from 'debug'
import { WebSocket } from 'ws'
import { Parser } from '~/parser'
import { sleep } from '~/utils'

const log = debug('server:tester')

export async function run() {
	if (!process.env.WS_PORT) return console.warn('WS_PORT not set')
	if (!process.env.TEST_TOKEN) return console.warn('TEST_TOKEN not set')

	await sleep(5000)
	const ws = new WebSocket(`ws://localhost:${process.env.WS_PORT}`)

	let parser = new Parser()
	ws.on('open', async () => {
		parser.initClient(ws)

		ws.send(
			await parser.stringify({
				type: 'login',
				data: {
					token: process.env.TEST_TOKEN,
				},
			}),
		)
		await sleep(1000)
		ws.send(
			await parser.stringify({
				type: 'move',
				data: { facing: [1, 0], vec: [1, 0] },
			}),
		)
		await sleep(3000)
		// ws.close()
	})
	ws.on('message', async data => {
		// @ts-ignore
		log('%s %o', new Date().toLocaleString(), await parser.parse(data))
	})
}
