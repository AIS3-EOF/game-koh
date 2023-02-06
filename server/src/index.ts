import { EventQueue } from '~/event_queue'
import { Manager } from '~/manager'

const eventQueue = new EventQueue()
const manager = new Manager(eventQueue)

import { ROUND_TIME_PREPARE, ROUND_TIME } from '~/config'
import { sleep } from '~/utils'

async function run() {
	while (true) {
		await eventQueue.manage('round_init')
		await sleep(ROUND_TIME_PREPARE)
		await eventQueue.manage('round_start')
		await sleep(ROUND_TIME)
		await eventQueue.manage('round_end')
	}
}
run()

if (require.main === module)
	require('~/tester').run()
