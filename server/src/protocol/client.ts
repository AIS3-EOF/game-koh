import { Event } from './events'

export interface LoginData {
    success: boolean
}
export interface LoginEvent {
    type: 'login'
    data: LoginData
}

export type ClientMessage = Event | LoginEvent
