import { Vec2 } from '../types';
import Weapon from './Weapon';

export default class Player extends Phaser.GameObjects.Container {
    public identifier: string;
    public graphics: Phaser.GameObjects.Graphics;
    public facing: Vec2 = [0, 1];
    public weapon: Weapon;
    constructor(scene, pos: Vec2, text: string, identifier: string, weaponType, damageRange) {
        const playerText = scene.add.text(0, 0, text);
        playerText.setOrigin(0.5);
        
        super(scene, pos[0], pos[1], playerText); // The frame is optional 
        this.scene.add.existing(this);

        this.setSize(20, 20);

        scene.physics.world.enable(this);
        // this.body.setCollideWorldBounds(true);

        this.identifier = identifier;
        this.graphics = scene.add.graphics();
        this.weapon = new Weapon(weaponType, damageRange);
    }

    face(facing: Vec2) {
        this.facing = facing;
    }
    
}
