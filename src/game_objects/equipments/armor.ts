import { Equipment } from "./equipment"
import { Player } from "../../game/player";


export class Armor extends Equipment {
    constructor() {
        super();
        this.identifier = 'Armor';
        // TODO: Replace texture here
        this.texture = 'armor';

        this.can_transfer = false;
        this.defense_modifier = 1;
    }
}