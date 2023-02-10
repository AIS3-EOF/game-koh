import Phaser from 'phaser'
import { Parser } from '~/parser'
import config from '@/config'
import GameMap from '@/resources/map'
import { ClientMessage, ServerMessage } from '@/types'

const allowPostTypes = ['login', 'round', 'init']

function postMessage(...args: any) {
	if (
		window.top &&
		window.top !== window &&
		allowPostTypes.includes(args?.[0]?.type)
	) {
		window.top.postMessage.apply(window.top, args)
	}
}

let parser: Parser | null = null

function onopen() {
	postMessage('ready', '*')
	const login_input = document.getElementById('login-input')
	if (!login_input) return
	login_input.removeAttribute('disabled')
	login_input.focus()
	login_input.addEventListener('keydown', event => {
		if (event.key === 'Enter' || event.key === 'NumpadEnter') {
			const token = (login_input as HTMLInputElement).value
			window.send({ type: 'login', data: { token } })
			postMessage({ type: 'login', data: { token } }, '*')
			login_input.setAttribute('disabled', 'true')
		}
	})
}

function onclose(event: CloseEvent) {
	window.send = () => {}
	// TODO: replace alert with something better
	if (window.top && window.top !== window) location.reload()
	// if (confirm('Connection closed')) location.reload()
}

async function onmessage(event: MessageEvent<ArrayBuffer>) {
	const message = (await parser!.parse(event.data)) as ClientMessage
	// console.log('recv', message)
	switch (message.type) {
		case 'login':
			if (message.data.success === true) {
				document.getElementById('login-container')?.remove()

				//Create a empty event queue
				window.events = []
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
			postMessage({ type: 'init', data: {} }, '*')

			window.gameMap = new GameMap(message.data.map)
			let mapJSON = window.gameMap.getJSON()
			window.sessionStorage.setItem('map', JSON.stringify(mapJSON))
			//Init Game
			new Phaser.Game(config)
			window.me = message.data.player.name

			break
		case 'round':
			postMessage({ type: 'round', data: message.data }, '*')
			break

		default:
	}
	if (message.type !== 'login') {
		window.events.push(message)
		document.dispatchEvent(new CustomEvent('event', { detail: message }))
	}
}

export async function setupWS(url: string | URL) {
	const ws = new WebSocket(url)
	ws.binaryType = 'arraybuffer'
	// ws.onopen = onopen
	ws.onclose = onclose
	await new Promise(resolve => ws.addEventListener('open', resolve))
	parser = new Parser()
	await parser.initClient(ws)
	ws.onmessage = onmessage
	onopen()

	window.send = async (message: ServerMessage) => {
		return ws.send(await parser!.stringify(message))
	}

	if (window.top && window.top !== window) {
		window.addEventListener('message', event => {
			if (event.data.type === 'login') {
				window.send({
					type: 'login',
					data: { token: event.data.data.token },
				})
			}
		})
	}
}
