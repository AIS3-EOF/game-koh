import Phaser from 'phaser'
import Player from '../resources/Player'
import { Vec2 } from '../types'
import { throttle } from 'underscore'
import { rotate, add } from '~/utils'

export default class Game extends Phaser.Scene {
	layer: any
	rt: any
	map: any
	players = new Map<string, Player>()
	me = {} as Player
	cursors: any

	updateVec = throttle((vec: Vec2) => {
		// me.setPosition(me.x + vec[0], me.y + vec[1])
		this.me.face(vec)
		window.send({ type: 'move', data: { vec, facing: this.me.facing } })
	}, 150, {trailing: false})

	faceAry: Vec2[] = []
	updateFace = throttle(() => {
		const vec = this.faceAry.reduce((acc, cur) => [acc[0] || cur[0], acc[1] || cur[1]], [0,0])
		this.faceAry = []
		if (vec[0] === 0 && vec[1] === 0) return
		this.updateVec(vec)
	}, 10, {trailing: false})

	constructor() {
		super('GameScene')
	}

	preload() {
		// this.load.tilemap('mapTile', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
		// this.load.image('map', 'assets/images/maptile.png', 46, 46);
		this.load.image('tiles', 'assets/images/tiles.png')
		this.load.tilemapTiledJSON('map', JSON.parse(window.sessionStorage.getItem('map')||'{}'))
		
	}

	create() {
		// render the initial map
		this.map = this.make.tilemap({ key: 'map' })
		var tiles = this.map.addTilesetImage('Maze', 'tiles', 32, 32, 0, 0)

		this.map.createLayer('Ground', tiles, 0, 0)
		
		this.cameras.main.setBackgroundColor('#990000')

		this.cursors = this.input.keyboard.createCursorKeys()

		this.players.clear()
	}

	update(time: number, delta: number): void {
		// pop from event queue, then handle
		const event = window.events.shift()
		if (event !== undefined) {
			switch (event.type) {
				case 'init':
					const me = event.data.player
					// window.me = me
					event.data.players.forEach(player => {
						const playerText = player.identifier === me.identifier ? '我' : '他'
						const playerObj = new Player(this, player.pos.map( x=> x*32+16 ) as Vec2, playerText, player.identifier, player.current_weapon.weapon_type, [[1,0],[2,0]])
						this.players.set(player.identifier, playerObj)
					})

					this.me = this.players.get(me.identifier)!
					this.cameras.main.startFollow(this.me, true, 0.05, 0.05)
					break
				case 'join':
					const player = event.data.player
					const other = new Player(this, player.pos, '他', player.identifier,  player.current_weapon.weapon_type, [[1,0],[2,0]])
					this.players.set(player.identifier, other)
					break
				case 'move':
					// if (event.data.identifier === window.me.identifier) return
					const { identifier, pos, facing } = event.data
					const playerObj = this.players.get(identifier)
					if (!playerObj) return

					playerObj.setPosition( ...event.data.pos.map(x=>x*32+16) )

					// draw arrow to indicate direction
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
						const { attacker, targets } = event.data
						const attackerObj = this.players.get(attacker)
						if (!attackerObj) return

						const { x, y, graphics, weapon, facing } = attackerObj
						const [fx, fy] = facing
						const angle = Math.atan2(fy, fx) * 180.0 / Math.PI
						for (const [rx, ry] of weapon.damageRange) {
							// const drawX = x + (16 * fx) + (rx * 32 * fx)
							// const drawY = y + (16 * fy) + (ry * 32 * fx)
							// console.log(x, y, rx, ry, fx, fy, drawX, drawY)
							let rv = rotate([ry, rx], facing).map(v => v * 32) as Vec2
							console.log(rx, ry, facing, rv, add([x,y], rv))
							let d = this.add.rectangle(...add([x,y], rv), 32, 32, 0x00FF00)
							d.angle = angle
							let opacity: number = 1;
							setInterval(() => {
								d.setAlpha(opacity -= 0.1)
							}, 30)
							setTimeout(() => {
								d.destroy();
							}, 300);
						}

						// for (const target of targets) {
						// 	const targetObj = this.players.get(target.identifier)
						// 	if (!targetObj) continue

						// 	const { x: ax, y: ay } = attackerObj
						// 	const { x: tx, y: ty } = targetObj

						// 	const { graphics } = attackerObj
						// 	graphics.clear()
						// 	// draw block to indicate attack
						// 	graphics.lineStyle(32, 0x990000, 1)
						// 	graphics.beginPath()
						// 	graphics.moveTo(ax, ay)
						// 	graphics.lineTo(tx, ty)
						// 	graphics.strokePath()
						// }
					}

					break
				default:
			}
		}

		// attack
		if (this.input.keyboard.checkDown(this.cursors.space, 100)) {
			window.send({ type: 'attack', data: { facing: this.me.facing } })
		}

		// player control
		const vec = [
			this.cursors.right.isDown - this.cursors.left.isDown,
			this.cursors.down.isDown - this.cursors.up.isDown
		] as Vec2
		if (vec.some(Boolean)) {
			this.faceAry.push(vec)
			this.updateFace()
		}
	}
}
