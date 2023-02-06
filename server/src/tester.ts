import { debug } from 'debug'
import { WebSocket } from 'ws'
import parser from '~/parser'
import { sleep } from '~/utils'

const log = debug('server:tester')

export async function run() {
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
    ws.on('message', data => {
        log("%s %o", new Date().toLocaleString(), parser.parse(data.toString()))
    })
}