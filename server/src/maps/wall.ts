import { MapObject } from './map_object'
import { Vec2 } from '@/protocol'


export class Wall extends MapObject {
    constructor(loc: Vec2) {
        super(loc)
        this.identifier += '::Wall'
        // TODO: Replace texture here
        this.texture = 'wall'
        this.can_walk = false
    }
}
