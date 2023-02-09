import { LoginMessageData } from '~/protocol'
import { Player } from '~/game'
import { ServerMessage } from '~/protocol'
import { Db } from 'mongodb'
import { WebSocket } from 'ws'

import { apiFetch } from '~/worker'
import parser from '~/parser'

const players = new Map<string, Player>()

export const handleLogin = async (ws: WebSocket, db: Db): Promise<Player> =>
	new Promise((_resolve, _reject) => {
		function remove() {
			ws.removeListener('message', message)
			ws.removeListener('close', close)
		}
		function resolve(data: any) {
			remove()
			_resolve(data)
		}
		function reject(err: Error) {
			remove()
			_reject(err)
		}

		function close() {
			reject(new Error('Connection closed'))
		}

		async function message(rawData: Buffer) {
			const msg: ServerMessage = parser.parse(rawData.toString())
			if (msg.type === 'login') {
				// handle login and retrieve player from database
				const { data } = msg
				let identifier = '', message = '', success = false
				if (data && data.token) {
					const res = await apiFetch('/team/my', {}, data.token)
					if (res.id) {
						identifier = res.name
						success = true
					} else {
						message = res.error ?? 'Invalid token'
					}
				}
				ws.send(
					parser.stringify({
						type: 'login',
						data: {
							success,
							message
						},
					}),
				)
				if (success) {
					const player = players.get(identifier) ?? new Player(identifier)
					if (!players.has(identifier))
						players.set(identifier, player)
					sockets.set(identifier, ws)
					resolve(player)
				}
			} else {
				ws.close()
				reject(new Error('Expected login message'))
			}
		}

		ws.addListener('message', message)
		ws.addListener('close', close)
	})
