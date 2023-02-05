import { Vec2 } from '@/protocol/shared'
import { Player } from '@/game/player'

import { debug } from 'debug'
import { Context } from '@/context';

const log = debug('server:MapObject')


export class MapObject {
    identifier: string = 'MapObject';
    can_walk: boolean;
    texture: string;
    location: Vec2;

    constructor(private loc: Vec2) {
        this.location = loc;
        this.can_walk = false;
        // TODO: Replace texture here
        this.texture = 'null';
    }

    interact(ctx: Context) {
        log(`${ctx.player.identifier} interacted with ${this.identifier}`)
    }
}
