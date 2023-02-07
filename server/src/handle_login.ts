import { LoginMessageData } from '~/protocol'
import { Player } from '~/game'
import { ServerMessage } from '~/protocol'
import { Db } from 'mongodb'
import { WebSocket } from 'ws'

import parser from '~/parser'

const players = new Map<string, Player>()

export const handleLogin = async (ws: WebSocket, db: Db): Promise<Player> =>
	new Promise((resolve, reject) => {
		ws.once('message', rawData => {
			const msg: ServerMessage = parser.parse(rawData.toString())
			if (msg.type === 'login') {
				// handle login and retrieve player from database
				const { data } = msg
				if (!data || !data.token) {
					ws.send(parser.stringify({ type: 'login', data: { success: false } }))
					ws.close()
					reject(new Error('Login failed'))
				} else {
					ws.send(parser.stringify({ type: 'login', data: { success: true } }))
					const player = players.get(data.token) ?? new Player(data.token)
					if (!players.has(data.token))
						players.set(data.token, player)
					sockets.set(data.token, ws)
					resolve(player)
				}
			} else {
				ws.close()
				reject(new Error('Expected login message'))
			}
		})
	})
