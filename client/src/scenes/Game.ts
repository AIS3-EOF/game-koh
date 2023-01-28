import Phaser from 'phaser';

export default class Game extends Phaser.Scene {

  layer: any;
  rt: any;
  map: any;
  player: any;
  cursors: any;

  constructor() {
    super('GameScene');
  }

  preload() {
    // this.load.tilemap('mapTile', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
    // this.load.image('map', 'assets/images/maptile.png', 46, 46);
    this.load.image('tiles', 'assets/images/tmw_desert_spacing.png');
    this.load.image('player', 'assets/images/black.png');
    this.load.tilemapTiledJSON('map', 'assets/map.json');

    this.load.image('logo', 'assets/phaser3-logo.png');
  }

  create() {
    // render the initial map
    this.map = this.make.tilemap({ key: 'map' });
    var tiles = this.map.addTilesetImage('Desert', 'tiles');
    this.layer = this.map.createLayer('Ground', tiles, 0, 0).setVisible(false);
    this.rt = this.add.renderTexture(0, 0, 800, 600);
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.player = this.physics.add.image(0, 0, 'player');
    window.p = this.physics;
    this.player.setCollideWorldBounds(true);
    this.playerText = this.add.text(this.player.x, this.player.y, '我');


    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
  }

  update(time: number, delta: number): void {
  
    // pop from event queue, then handle
    const event = window.events.shift();
    if (event !== undefined) {
      console.log("update", event);
      switch (event.type) {
        case "join":
          break;
        default:
      }
    }
    // this.rt.camera.rotation -= 0.01;

    this.rt.clear();
    this.rt.draw(this.layer);

    // player control
    this.player.setVelocity(0);

    if (this.cursors.left.isDown)
    {
        this.player.setVelocityX(-500);
    }
    else if (this.cursors.right.isDown)
    {
        this.player.setVelocityX(500);
    }

    if (this.cursors.up.isDown)
    {
        this.player.setVelocityY(-500);
    }
    else if (this.cursors.down.isDown)
    {
        this.player.setVelocityY(500);
    }

    //update player text position
    this.playerText.setPosition(this.player.x, this.player.y);


    const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
    // Rounds down to nearest tile
    const pointerTileX = this.map.worldToTileX(worldPoint.x);
    const pointerTileY = this.map.worldToTileY(worldPoint.y);
    if (this.input.manager.activePointer.isDown)
    {
        // Fill the tiles within an area with sign posts (tile id = 46)
        this.map.fill(46, pointerTileX, pointerTileY, 6, 6);
    }
  }
}
