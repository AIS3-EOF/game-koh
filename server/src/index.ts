import { debug } from 'debug'
import * as dotenv from 'dotenv'
import { WebSocketServer } from 'ws'
import express from 'express'
import logger from 'morgan'

// @ts-ignore
globalThis.DEVELOPMENT = typeof BUILD === 'undefined'
globalThis.PRODUCTION = !DEVELOPMENT

declare global {
	var DEVELOPMENT: boolean
	var PRODUCTION: boolean
}

if (DEVELOPMENT) {
	dotenv.config({
		path: require('path').resolve(__dirname, '../../share.env'),
	})
	dotenv.config()
}

const log = debug('server:index')

import { connect } from '~/db'
import { EventQueue } from '~/event_queue'
import { Sockets } from '~/sockets'
import { Manager } from '~/manager'
import { setupWorker } from '~/worker'

import { ROUND_TIME_INIT, ROUND_TIME, ROUND_TIME_END } from '~/config'
import { sleep } from '~/utils'

globalThis.eventQueue = new EventQueue()
globalThis.sockets = new Sockets()

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
	log('connecting to database...')
	globalThis.db = await connect()
	log('connected to database')

	const manager = new Manager()
	setupWorker(manager)
	// run(manager)

	const app = express()
	app.use(logger('tiny'))

	if (PRODUCTION) {
		app.use(express.static(require('path').resolve(__dirname, '../../client/dist')))
	}

	app.use('/api/', async (req, res) => {
		manager.handleApi(req, res)
	})

	const server = app.listen(Number(process.env.SERVER_PORT), () => {
		console.log(`listening on port ${process.env.SERVER_PORT}`)
	})

	const wss = new WebSocketServer(
		DEVELOPMENT
			? { port: Number(process.env.WS_PORT) }
			: { noServer: true },
	)

	if (PRODUCTION) {
		server.on('upgrade', (req, socket, head) => {
			if (req.url === '/ws') {
				wss.handleUpgrade(req, socket, head, ws => {
					wss.emit('connection', ws, req)
				})
			} else {
				socket.destroy()
			}
		})
	}

	wss.on('connection', ws => {
		log('new connection')
		manager.handleConnection(ws)
	})
}

setup()

if (DEVELOPMENT) import('~/tester').then(tester => tester.run())
