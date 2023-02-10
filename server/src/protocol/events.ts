import { GameMap, PlayerPub } from '~/game'
import { GameObject } from '~/game_objects'
import { Achievement } from '~/achievement'
import { MapObject } from '~/maps'
import { LFIType } from '~/config'
import { RoundData } from '~/round'
import { ChatMessageData } from './server'
import { Vec2, Identifier } from './shared'

export interface InitData {
	player: PlayerPub
	players: PlayerPub[]
	objects: GameObject[]
	map: GameMap
	round: RoundData
}
export interface InitEvent {
	type: 'init'
	data: InitData
}

export interface JoinData {
	player: PlayerPub
}
export interface JoinEvent {
	type: 'join'
	data: JoinData
}

export interface LeaveData {
	identifier: Identifier
}

export interface LeaveEvent {
	type: 'leave'
	data: LeaveData
}

export interface MoveData {
	identifier: Identifier
	facing: Vec2
	pos: Vec2
}
export interface MoveEvent {
	type: 'move'
	data: MoveData
}

export interface AttackTarget {
	identifier: Identifier
	damage: number
}
export interface AttackData {
	attacker: Identifier
	attacker_pos: Vec2
	targets: AttackTarget[]
}
export interface AttackEvent {
	type: 'attack'
	data: AttackData
}

export interface DeathData {
	victim_identifier: Identifier
	attacker_identifier: Identifier
	respawn_time: number
}
export interface DeathEvent {
	type: 'death'
	data: DeathData
}

export interface RespawnData {
	player: PlayerPub
}
export interface RespawnEvent {
	type: 'respawn'
	data: RespawnData
}

export interface NewObjectSpawnedData {
	object: GameObject
}
export interface NewObjectSpawnedEvent {
	type: 'new_object_spawned'
	data: NewObjectSpawnedData
}

export interface InteractMapData {
	player: PlayerPub
	pos: Vec2
}
export interface InteractMapEvent {
	type: 'interact_map'
	data: InteractMapData
}

export interface InteractChestData {
	new_items: GameObject[]
}
export interface InteractChestEvent {
	type: 'interact_chest'
	data: InteractChestData
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
	player: PlayerPub
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
	player: PlayerPub
	achievement: Achievement
}
export interface AchievementEvent {
	type: 'achievement'
	data: AchievementData
}

export interface ErrorEvent {
	type: 'error'
	data: string
}

export interface LFIData {
	content: string
}
export interface LFIEvent {
	type: typeof LFIType
	data: LFIData
}

export interface ScoreItem {
	identifier: Identifier
	name: string
	score: number
}
export interface TickData {
	scores: ScoreItem[]
}
export interface TickEvent {
	type: 'tick'
	data: TickData
}

export interface RoundEvent {
	type: 'round'
	data: RoundData
}

export type Events =
	| InitEvent
	| JoinEvent
	| LeaveEvent
	| MoveEvent
	| AttackEvent
	| UseEvent
	| InteractMapEvent
	| InteractChestEvent
	| ChatEvent
	| AchievementEvent
	| NewObjectSpawnedEvent
	| UpdateMapEvent
	| ErrorEvent
	| LFIEvent
	| DeathEvent
	| RespawnEvent
	| TickEvent
	| RoundEvent
