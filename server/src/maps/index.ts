import { MapObject } from './map_object'
import { Ground } from './ground'
import { Wall } from './wall'
import { Chest } from './chest'

export { MapObject, Ground, Wall, Chest }

export enum MapObjectType {
    Ground,
    Wall,
    Chest,
}

export const MapObjectClass = new Map<MapObjectType, any>([
    [MapObjectType.Ground, Ground],
    [MapObjectType.Wall, Wall],
    [MapObjectType.Chest, Chest],
])