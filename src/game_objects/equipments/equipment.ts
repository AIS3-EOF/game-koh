import { GameObject } from "../game_object"
import { Player } from "../../game/player";


export class Equipment extends GameObject {
    attack_modifier: number = 0;
    defense_modifier: number = 0;
    can_transfer: boolean = true;  // Will the equipment be transfered to player's inventory when being replaced

    constructor() {
        super();
        this.identifier = 'GameObject::Equipment';
        this.texture = 'equipment';
    }

    use(player: Player) {
        super.use(player);
        // TODO: equip the equipment

        if (!this.can_transfer) {
            return;
        }
        // TODO: send the previous equipment to player's inventory
    }
}