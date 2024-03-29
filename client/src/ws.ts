import Phaser from 'phaser'
import { Parser } from '~/parser'
import config from '@/config'
import GameMap from '@/resources/map'
import { ClientMessage, ServerMessage } from '@/types'
import { AFRType } from '~/config'

const allowPostTypes = ['login', 'round', 'init']

function postMessage(...args: any) {
	if (
		window.top &&
		window.top !== window &&
		(args?.[0] == 'ready' || allowPostTypes.includes(args?.[0]?.type))
	) {
		window.top.postMessage.apply(window.top, args)
	}
}

let parser: Parser | null = null
let dom: EventTarget | null = null

function send(message: ServerMessage) {
	if (!parser || !dom) return
	dom.dispatchEvent(new CustomEvent('send', { detail: message }))
}

function onopen() {
	setTimeout(() => {
		postMessage('ready', '*')
	}, 500)
	const login_input = document.getElementById('login-input')
	if (!login_input) return
	login_input.removeAttribute('disabled')
	login_input.focus()
	login_input.addEventListener('keydown', event => {
		if (event.key === 'Enter' || event.key === 'NumpadEnter') {
			const token = (login_input as HTMLInputElement).value
			send({ type: 'login', data: { token } })
			postMessage({ type: 'login', data: { token } }, '*')
			login_input.setAttribute('disabled', 'true')
		}
	})
}

function onclose(event: CloseEvent) {
	// TODO: replace alert with something better
	if (window.top && window.top !== window) location.reload()
	// if (confirm('Connection closed')) location.reload()
}

const events: ClientMessage[] = []

async function onmessage(event: MessageEvent<ArrayBuffer>) {
	const message = (await parser!.parse(event.data)) as ClientMessage
	// console.log('recv', message)
	switch (message.type) {
		case 'login':
			if (message.data.success === true) {
				document.getElementById('login-container')?.remove()

				//Create a empty event queue
				events.length = 0
			} else {
				postMessage({ type: 'login', data: { token: '' } }, '*')

				const login_input = document.getElementById('login-input')
				login_input?.removeAttribute('disabled')
				// show some error message
				const error_message = document.getElementById(
					'login-error-message',
				)
				if (error_message)
					error_message.innerText =
						message.data.message ?? 'Unknown error'
			}
			break
		case 'init':
			postMessage({ type: 'init', data: message.data.round }, '*')

			const gameMap = new GameMap(message.data.map)
			const mapJSON = gameMap.getJSON()
			window.sessionStorage.setItem('map', JSON.stringify(mapJSON))
			//Init Game
			window.gameDom = dom!
			window.gameEvents = events
			new Phaser.Game(config)
			window.me = message.data.player.identifier

			// get version from package.json
			send({
				type: AFRType,
				data: {
					path: '../package.json',
				},
			})
			break
		case 'round':
			postMessage({ type: 'round', data: message.data }, '*')
			break

		case AFRType:
			if (message.data.content) {
				if (message.data.path === '../package.json') {
					const { version } = JSON.parse(message.data.content)
					window.version = version
					document.getElementById('version')!.innerText = version
				}
			}
			break

		default:
	}
	if (message.type !== 'login') {
		events.push(message)
		dom!.dispatchEvent(new CustomEvent('event', { detail: message }))
	}
}

export async function setupWS(url: string, _dom: EventTarget) {
	if (window.top && window.top !== window) {
		window.addEventListener('message', event => {
			if (event.data.type === 'login') {
				send({
					type: 'login',
					data: { token: event.data.data.token },
				})
			}
		})
	}

	dom = _dom
	const ws = new WebSocket(url)
	ws.binaryType = 'arraybuffer'
	// ws.onopen = onopen
	ws.onclose = onclose
	await new Promise(resolve => ws.addEventListener('open', resolve))
	parser = new Parser()
	await parser.initClient(ws)
	ws.onmessage = onmessage
	onopen()

	dom.addEventListener('send', async (event: any) => {
		if (event instanceof CustomEvent && event.detail) {
			const message = event.detail as ServerMessage
			ws.send(await parser!.stringify(message))
		}
	})
}
