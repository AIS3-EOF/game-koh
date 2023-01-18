import { Vec2 } from '../protocol/shared'
import { Player } from '../game/player'

import { debug } from 'debug'

const log = debug('server:MapObject')


export class MapObject {
    identifier: string = 'MapObject::MapObject';
    can_walk: boolean;
    texture: string;
    location: Vec2;

    constructor(private loc: Vec2) {
        this.location = loc;
        this.can_walk = false;
        // TODO: Replace texture here
        this.texture = 'null';
    }

    interact(player: Player) {
        log(`${player.identifier} interacted with ${this.identifier}`)
    }
}