import { debug } from 'debug'
import * as dotenv from 'dotenv'
import { WebSocketServer } from 'ws'
dotenv.config({ path: require('path').resolve(__dirname, '../../share.env') })
dotenv.config()

const log = debug('server:index')

import { connect } from '~/db'
import { EventQueue } from '~/event_queue'
import { Manager } from '~/manager'

import { ROUND_TIME_INIT, ROUND_TIME, ROUND_TIME_END } from '~/config'
import { sleep } from '~/utils'

globalThis.eventQueue = new EventQueue()
globalThis.sockets = new Map()

async function run(manager: Manager) {
	while (true) {
		manager.roundInit()
		await sleep(ROUND_TIME_INIT)
		manager.roundStart()
		await sleep(ROUND_TIME)
		manager.roundEnd()
		await sleep(ROUND_TIME_END)
	}
}

async function setup() {
	const db = await connect()
	log('connected to database')

	const manager = new Manager(db)

	const wss = new WebSocketServer({ port: Number(process.env.WS_PORT) })
	wss.on('connection', ws => {
		log('new connection')
		manager.handleConnection(ws)
	})

	run(manager)
}
setup()

if (require.main === module) require('~/tester').run()
