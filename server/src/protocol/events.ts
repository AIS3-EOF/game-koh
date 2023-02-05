import { GameMap } from "@/game/gamemap"
import { Player } from "@/game/player"
import { Weapon } from "@/game_objects/equipments/weapon"
import { GameObject } from "@/game_objects/game_object"
import { Item } from "@/game_objects/items/item"
import { Achievement } from "@/achievement/achievement"
import { MapObject } from "@/maps/map_object"
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
    identifier: string
    facing: Vec2
    pos: Vec2
}
export interface MoveEvent {
    type: 'move'
    data: MoveData
}

export interface AttackTarget {
    identifier: string
    damage: number
}
export interface AttackData {
    attacker: string
    attacker_pos: Vec2
    targets: AttackTarget[]
}
export interface AttackEvent {
    type: 'attack'
    data: AttackData
}

export interface NewObjectSpawnedData {
    object: GameObject
}
export interface NewObjectSpawnedEvent {
    type: 'new_object_spawned'
    data: NewObjectSpawnedData
}

export interface InteractMapData {
    player: Player
    pos: Vec2
}
export interface InteractMapEvent {
    type: 'interact_map'
    data: InteractMapData
}

export interface UpdateMapEventData {
    pos: Vec2
    map_object: MapObject
}
export interface UpdateMapEvent {
    type: 'update_map'
    data: UpdateMapEventData
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

export interface AchievementData {
    player: Player
    archieve: Achievement
}
export interface AchievementEvent {
    type: 'achievement'
    data: AchievementData
}

export interface ErrorEvent {
    type: 'error'
    data: string
}

export type Event = InitEvent | JoinEvent | MoveEvent | AttackEvent | NewObjectSpawnedEvent | UseEvent | ChatEvent | AchievementEvent | ErrorEvent | InteractMapEvent
