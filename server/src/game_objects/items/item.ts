import { GameObject } from "../game_object"
import { Context } from "~/context";


export class Item extends GameObject {
    constructor() {
        super();
        this.identifier += '::Item';
        this.texture = 'item';
    }

    use(ctx: Context) {
        super.use(ctx);
        // TODO: Perform item effect to player
        // add health, deal damage, teleport, global message, etc.
    }
}
