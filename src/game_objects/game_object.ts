import { Player } from "../game/player"
import { debug } from 'debug'


const log = debug('server:GameObject');


export class GameObject {
    identifier: string = 'GameObject:GameObject'
    texture: string = 'null'
    
    constructor() {
    }

    use(player: Player) {
        log(`${player.identifier} used ${this.identifier}`)
    }
};