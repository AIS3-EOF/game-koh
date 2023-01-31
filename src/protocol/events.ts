import { GameMap } from "../game/gamemap"
import { Player } from "../game/player"
import { Weapon } from "../game_objects/equipments/weapon"
import { GameObject } from "../game_objects/game_object"
import { Item } from "../game_objects/items/item"
import { Achievement } from "../achievement/achievement"
import { ChatMessageData } from './server'
import { Vec2 } from "./shared"

export interface InitData {
    player: Player
    players: Player[]
    objects: GameObject[]
    map: GameMap
}
export interface InitEvent {
    type: 'init'
    data: InitData
}

export interface JoinData {
    player: Player
}
export interface JoinEvent {
    type: 'join'
    data: JoinData
}

export interface MoveData {
    player: Player
}
export interface MoveEvent {
    type: 'move'
    data: MoveData
}

export interface AttackData {
    attacker: Player
    target: Player
    damage: number
}
export interface AttackEvent {
    type: 'attack'
    data: AttackData
}

export interface NewObjectData {
    object: GameObject
}
export interface NewObjectEvent {
    type: 'new_object'
    data: NewObjectData
}

export interface UseData extends Record<string, any> {
    player: Player
    object: GameObject
}
export interface UseEvent {
    type: 'use'
    data: UseData
}

export type ChatData = ChatMessageData
export type ChatEvent = {
    type: 'chat'
    data: ChatData
}

export interface AchieveData {
    player: Player
    archieve: Achievement
}
export interface ArchieveEvent {
    type: 'archieve'
    data: AchieveData
}

export interface ErrorEvent {
    type: 'error'
    data: string
}

export type Event = InitEvent | JoinEvent | MoveEvent | AttackEvent | NewObjectEvent | UseEvent | ChatEvent | ArchieveEvent | ErrorEvent
