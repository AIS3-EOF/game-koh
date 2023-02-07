import { Vec2, GameObject, Player as Server_Player } from '../types';
import Weapon from './Weapon';

export default class Player extends Phaser.GameObjects.Container {
    public graphics: Phaser.GameObjects.Graphics;
    public facing: Vec2 = [0, 1];
    public identifier: string
    public pos: Vec2
    public weapon: Weapon
    public inventory: GameObject[]

    constructor(
        scene: Phaser.Scene,
        text: string,
        player: Server_Player,
    ) {
        const playerText = scene.add.text(0, 0, text, {color: 'white'});
        playerText.setOrigin(0.5);
        super(scene, ...player.pos.map((x: number) => x*32+16), playerText); // The frame is optional 
        this.scene.add.existing(this);

        this.setSize(20, 20);

        scene.physics.world.enable(this);
        // this.body.setCollideWorldBounds(true);

        this.graphics = scene.add.graphics();

        this.updatePlayer(player)
    }

    updatePlayer(player: Server_Player) {
        this.identifier = player.identifier
        this.weapon = new Weapon(
            player.current_weapon.weapon_type,
            player.current_weapon.range
        )
        this.inventory = player.inventory
        this.face(player.facing)
        this.setPositionTo(player.pos)
    }

    face(facing: Vec2) {
        this.facing = facing;
    }

    setPositionTo(pos: Vec2){
        this.pos = pos
        this.setPosition(...pos.map(x=>x*32+16))
    }
    
}
