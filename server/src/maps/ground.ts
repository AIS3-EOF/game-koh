import { MapObject } from './map_object'
import { Vec2 } from '../protocol/shared'


export class Ground extends MapObject {
    constructor(loc: Vec2) {
        super(loc)
        this.identifier += '::Ground'
        // TODO: Replace texture here
        this.texture = 'ground'
        this.can_walk = true
    }
}