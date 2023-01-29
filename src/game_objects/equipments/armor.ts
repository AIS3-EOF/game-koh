import { Equipment } from "./equipment"
import { Context } from "../../context"

export function generateArmor() {
    return new Armor();
}

export class Armor extends Equipment {
    constructor() {
        super();
        this.identifier += '::Armor';
        // TODO: Replace texture here
        this.texture = 'armor';

        this.can_transfer = false;
        this.defense_modifier = 1;
    }


    use(ctx: Context) {
        super.use(ctx)

        if (ctx.player.removeObject(this)) {
            ctx.player.addObject(ctx.player.current_armor)
            ctx.player.current_armor = this
        }
    }
}