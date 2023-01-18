import { LoginMessageData } from './protocol/server'
import { Player } from './game/player'
import { ServerMessage } from './protocol/server'
import { Db } from 'mongodb'
import { WebSocket } from 'ws'

export const handleLogin = async (ws: WebSocket, db: Db): Promise<Player> =>
	new Promise((resolve, reject) => {
		ws.once('message', rawData => {
			const msg: ServerMessage = JSON.parse(rawData.toString())
			if (msg.type === 'login') {
				// handle login and retrieve player from database
				const data: LoginMessageData = msg.data
				resolve(new Player())
			} else {
				ws.close()
				reject(new Error('Expected login message'))
			}
		})
	})
