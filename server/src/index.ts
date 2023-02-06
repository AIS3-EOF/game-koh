import { debug } from 'debug'
import * as dotenv from 'dotenv'
dotenv.config()

const log = debug('server:index')

import { connect } from '~/db'
import { EventQueue } from '~/event_queue'
import { Manager } from '~/manager'

import { ROUND_TIME_INIT, ROUND_TIME, ROUND_TIME_END } from '~/config'
import { sleep } from '~/utils'

globalThis.eventQueue = new EventQueue()

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
	
	run(manager)
}
setup()

if (require.main === module)
	require('~/tester').run()
