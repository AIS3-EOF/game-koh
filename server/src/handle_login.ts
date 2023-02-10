import { Player } from '~/game'
import { ServerMessage, InitIdentifier } from '~/protocol'
import { WebSocket } from 'ws'

import { apiFetch } from '~/worker'
import { Parser } from '~/parser'

const players = new Map<number, Player>()

export const handleLogin = async (
	ws: WebSocket,
	parser: Parser,
): Promise<Player> =>
	new Promise((_resolve, _reject) => {
		function remove() {
			ws.removeListener('message', message)
			ws.removeListener('close', close)
		}
		function resolve(data: any) {
			remove()
			_resolve(data)
		}
		function reject(err: any) {
			remove()
			_reject(err)
		}

		function close() {
			reject('Connection closed')
		}

		async function message(rawData: Buffer) {
			const msg: ServerMessage = await parser.parse(
				new Uint8Array(rawData).buffer,
			)
			if (msg.type === 'login') {
				// handle login and retrieve player from database
				const { data } = msg
				let id = InitIdentifier,
					name = '',
					message = '',
					success = false
				if (data && data.token) {
					const res = await apiFetch('/team/my', {
						token: data.token.toString(),
					})
					if (res.id) {
						id = res.id
						name = res.name
						success = true
					} else {
						message = res.error ?? 'Invalid token'
					}
				}
				ws.send(
					await parser.stringify({
						type: 'login',
						data: {
							success,
							message,
						},
					}),
				)
				if (success) {
					const player = players.get(id) ?? new Player(id, name)
					if (!players.has(id)) players.set(id, player)
					resolve(player)
				}
			} else {
				ws.close()
				reject('Expected login message')
			}
		}

		ws.addListener('message', message)
		ws.addListener('close', close)
	})
