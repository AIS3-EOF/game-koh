const hint = '/tmp/app.tar.gz contains the source code for this app.'
if (process.env.HINT) console.log(hint)

import { debug } from 'debug'
import * as dotenv from 'dotenv'
import { WebSocketServer } from 'ws'
import express from 'express'
import logger from 'morgan'

process.on('uncaughtException', function (err) {
	console.log('Caught exception: ', err)
})
process.on('unhandledRejection', function (err) {
	console.log('Caught rejection: ', err)
})

// @ts-ignore
globalThis.DEVELOPMENT = typeof BUILD === 'undefined'
globalThis.PRODUCTION = !DEVELOPMENT
globalThis.VERSION = PRODUCTION ? require('../../package.json').version : 'dev'

declare global {
	var DEVELOPMENT: boolean
	var PRODUCTION: boolean
	var VERSION: string
}

if (DEVELOPMENT) {
	dotenv.config({
		path: require('path').resolve(__dirname, '../../share.env'),
	})
	dotenv.config()
}

const log = debug('server:index:log')

import { connect } from '~/db'
import { EventQueue } from '~/event_queue'
import { Sockets } from '~/sockets'
import { Manager } from '~/manager'
import { setupWorker } from '~/worker'

import { sleep } from '~/utils'

globalThis.eventQueue = new EventQueue()
globalThis.sockets = new Sockets()

async function setup() {
	log('connecting to database...')
	globalThis.db = await connect()
	log('connected to database')

	const manager = new Manager()
	setupWorker(manager)

	const app = express()

	if (PRODUCTION) {
		app.use(
			express.static(
				require('path').resolve(__dirname, '../../client/dist'),
			),
		)
	}

	app.use(logger('tiny'))

	app.use('/api/', async (req, res) => {
		manager.handleApi(req, res)
	})

	const server = DEVELOPMENT
		? require('http').createServer(app)
		: require('https').createServer(
				{
					key: require('fs').readFileSync(
						require('path').resolve(__dirname, '../../server.key'),
					),
					cert: require('fs').readFileSync(
						require('path').resolve(__dirname, '../../server.cert'),
					),
				},
				app,
		  )

	server.listen(Number(process.env.SERVER_PORT), () => {
		console.log(`listening on port ${process.env.SERVER_PORT}`)
	})

	const wss = new WebSocketServer(
		DEVELOPMENT
			? { port: Number(process.env.WS_PORT) }
			: { noServer: true },
	)

	if (PRODUCTION) {
		// @ts-ignore
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

// if (DEVELOPMENT) import('~/tester').then(tester => tester.run())
