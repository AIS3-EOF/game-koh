import { GameObject } from "../game_object"
import { Player } from "../../game/player";


export class Item extends GameObject {
    constructor() {
        super();
        this.identifier = 'GameObject::Item';
        this.texture = 'item';
    }

    use(player: Player) {
        super.use(player);
        // TODO: Perform item effect to player
        // add health, deal damage, teleport, global message, etc.
    }
}