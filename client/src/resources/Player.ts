import { Vec2 } from '../types';

export default class Player extends Phaser.GameObjects.Container{
    public identifier: string;
    public graphics: Phaser.GameObjects.Graphics;
    public facing: Vec2 = [0, 1];
    constructor(scene, x, y, text, identifier){
        const playerText = scene.add.text(0, 0, text);
        playerText.setOrigin(0.5);
        
        super(scene, x, y, playerText); // The frame is optional 
        this.scene.add.existing(this);

        this.setSize(20, 20);

        scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(true);

        this.identifier = identifier;
        this.graphics = scene.add.graphics();
    }

    face(facing: Vec2) {
        this.facing = facing;
    }
}
