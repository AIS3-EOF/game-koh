import Phaser from 'phaser';
import Player from '../resources/Player';

export default class Game extends Phaser.Scene {

  layer: any;
  rt: any;
  map: any;
  players: any;
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
  }

  create() {
    // render the initial map
    this.map = this.make.tilemap({ key: 'map' });
    var tiles = this.map.addTilesetImage('Desert', 'tiles');
    this.layer = this.map.createLayer('Ground', tiles, 0, 0).setVisible(false);
    this.rt = this.add.renderTexture(0, 0, 800, 600);
    this.rt.draw(this.layer);
    
    this.cursors = this.input.keyboard.createCursorKeys();

    this.players = new Map();
  }

  update(time: number, delta: number): void {
  
    // pop from event queue, then handle
    const event = window.events.shift();
    if (event !== undefined) {
      switch (event.type) {
        case "init":
          const me = event.data.player;

          event.data.players.forEach(player => {
            const playerText = player.identifier === me.identifier ? '我': '他';
            const playerObj = new Player(this, ...player.pos , playerText, player.identifier);
            this.players.set(player.identifier, playerObj);
          });

          this.cameras.main.startFollow(this.players.get(me.identifier), true, 0.05, 0.05);
          break;
        case "join":
          const player = event.data.player;
          const other = new Player(this, ...player.pos , '他', player.identifier);
          this.players.set(player.identifier, other);
          break;
        case "move":
          this.players.get(event.data.player.identifier)?.setPosition(...event.data.player.pos);
          break;
        default:
      }
    }

    // player control
    var vec = [(this.cursors.right.isDown - this.cursors.left.isDown)*10,
               (this.cursors.down.isDown - this.cursors.up.isDown)*10]
    if(vec.some(Boolean))
      ws.send(JSON.stringify({type: "move", data: {vec}}))


    /*
    const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
    // Rounds down to nearest tile
    const pointerTileX = this.map.worldToTileX(worldPoint.x);
    const pointerTileY = this.map.worldToTileY(worldPoint.y);
    if (this.input.manager.activePointer.isDown)
    {
        // Fill the tiles within an area with sign posts (tile id = 46)
        this.map.fill(46, pointerTileX, pointerTileY, 6, 6);
    }
    */
  }
}
