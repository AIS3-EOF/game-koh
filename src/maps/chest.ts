import { MapObject } from './map_object'
import { Vec2 } from '../protocol/shared'
import { Player } from '../game/player'
import { GameObject } from '../game_objects/game_object'


export class Chest extends MapObject {
    contains: GameObject[] = [];

    constructor(loc: Vec2, items: GameObject[]) {
        super(loc)
        this.identifier = 'MapObject::Chest'
        // TODO: Replace texture here
        this.texture = 'chest'
        this.can_walk = true
        this.contains = items
    }

    interact(player: Player) {
        super.interact(player)

        // TODO: Add the item to the player's inventory
    }
}