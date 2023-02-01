import { MapObject } from './map_object'
import { Vec2 } from '../protocol/shared'
import { Player } from '../game/player'
import { GameObject } from '../game_objects/game_object'
import { Context } from '../context';


export class Chest extends MapObject {
    chest_inventory: GameObject[] = [];

    constructor(loc: Vec2, items: GameObject[]) {
        super(loc)
        this.identifier += '::Chest'
        // TODO: Replace texture here
        this.texture = 'chest'
        this.can_walk = true
        this.chest_inventory = items
    }

    interact(ctx: Context) {
        super.interact(ctx)

        ctx.player.inventory.push(...this.chest_inventory)
        this.chest_inventory = []

        // TODO: Notify the player
    }
}