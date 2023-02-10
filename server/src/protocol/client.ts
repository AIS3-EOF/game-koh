import { Events } from './events'

export interface LoginData {
	success: boolean
	message?: string
}
export interface LoginEvent {
	type: 'login'
	data: LoginData
}

export type ClientMessage = Events | LoginEvent
