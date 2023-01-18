import { Equipment } from "./equipment"
import { Player } from "../../game/player";


export class Weapon extends Equipment {
    constructor() {
        super();
        this.identifier = 'Weapon';
        // TODO: Replace texture here
        this.texture = 'weapon';

        this.can_transfer = false;
        this.attack_modifier = 1;
    }
}