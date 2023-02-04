import Phaser from 'phaser'
import Player from '../resources/Player'

export default class Game extends Phaser.Scene {
	layer: any
	rt: any
	map: any
	players: Map<string, Player>
	cursors: any

	me: any

	constructor() {
		super('GameScene')
	}

	preload() {
		// this.load.tilemap('mapTile', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
		// this.load.image('map', 'assets/images/maptile.png', 46, 46);
		this.load.image('tiles', 'assets/images/tiles.png')
		this.load.image('player', 'assets/images/black.png')
		this.load.tilemapTiledJSON('map', 'assets/map.json')
	}

	create() {
		// render the initial map
		this.map = this.make.tilemap({ key: 'map' })
		var tiles = this.map.addTilesetImage('Maze', 'tiles')
		this.layer = this.map.createLayer('Ground', tiles, 0, 0)
		// this.rt = this.add.renderTexture(0, 0, 1920, 1080)
		// this.rt.draw(this.layer)

		this.cameras.main.setBackgroundColor('#990000')

		this.cursors = this.input.keyboard.createCursorKeys()

		this.players = new Map()
	}

	update(time: number, delta: number): void {
		// pop from event queue, then handle
		const event = window.events.shift()
		if (event !== undefined) {
			switch (event.type) {
				case 'init':
					const me = event.data.player
					window.me = me

					event.data.players.forEach(player => {
						const playerText = player.identifier === me.identifier ? '我' : '他'
						const playerObj = new Player(this, ...player.pos, playerText, player.identifier)
						this.players.set(player.identifier, playerObj)
					})

					this.cameras.main.startFollow(this.players.get(me.identifier), true, 0.05, 0.05)
					break
				case 'join':
					const player = event.data.player
					const other = new Player(this, ...player.pos, '他', player.identifier)
					this.players.set(player.identifier, other)
					break
				case 'move':
					// if (event.data.player.identifier === window.me.identifier) return
					const playerObj = this.players.get(event.data.player.identifier)
					playerObj?.setPosition(...event.data.player.pos)

					// draw arrow to indicate direction
					const { facing } = event.data.player
					const { x, y } = playerObj
					const { width, height } = playerObj
					const { graphics } = playerObj
					graphics.clear()
					graphics.lineStyle(2, 0x009900, 1)
					graphics.beginPath()
					// begin from the center of the player
					const [fx, fy] = facing
					graphics.moveTo(x, y)
					graphics.lineTo(x + (fx * (width + 30)) / 2, y + (fy * (height + 30)) / 2)
					graphics.strokePath()
					break
				case 'attack':
					{
						const { attacker, target, damage } = event.data
						const attackerObj = this.players.get(attacker)
						const targetObj = this.players.get(target)
						if (!attackerObj || !targetObj) return

						const { x: ax, y: ay } = attackerObj
						const { x: tx, y: ty } = targetObj

						const { graphics } = attackerObj
						graphics.clear()
						// draw block to indicate attack
            graphics.lineStyle(32, 0x990000, 1)
            graphics.beginPath()
            graphics.moveTo(ax, ay)
            graphics.lineTo(tx, ty)
            graphics.strokePath()

					}

					break
				default:
			}
		}

		const vec = [
			this.cursors.right.isDown - this.cursors.left.isDown,
			this.cursors.down.isDown - this.cursors.up.isDown
		]
    const me = this.players.get(window.me?.identifier)

		// attack
		if (this.input.keyboard.checkDown(this.cursors.space, 100)) {
			ws.send(JSON.stringify({ type: 'attack', data: { facing: me?.facing } }))
		}

		// player control
		if (vec.some(Boolean)) {
			// me?.setPosition(me.x + vec[0], me.y + vec[1])
      me?.face(vec)
			ws.send(JSON.stringify({ type: 'move', data: { vec, facing:me?.facing } }))
		}
	}
}
