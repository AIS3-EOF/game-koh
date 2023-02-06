import Phaser from 'phaser'
import { throttle } from 'underscore'
import Player from '@/resources/Player'
import Weapon from '@/resources/Weapon';
import { Vec2 } from '@/types'
import { rotate, add } from '~/utils'
import { ClientMessage } from '@/types'

export default class Game extends Phaser.Scene {
	layer: any
	topLayer: any
	map: any
	players = new Map<string, Player>()
	me = {} as Player
	cursors: any

	raycaster: any
	ray: any
	intersections: any
	graphics: any
	maskGraphics: any
	fow: any
	fovRange: any
	viewableRange: any

	updateVec = throttle((vec: Vec2) => {
		// me.setPosition(me.x + vec[0], me.y + vec[1])
		this.me.face(vec)
		let newPos = add(this.me.pos, vec)

		window.send({ type: 'move', data: { vec, facing: this.me.facing } })

	}, 150, {trailing: false})

	faceAry: Vec2[] = []
	updateFace = throttle(() => {
		const vec = this.faceAry.reduce((acc, cur) => [acc[0] || cur[0], acc[1] || cur[1]], [0,0])
		this.faceAry = []
		if (vec[0] === 0 && vec[1] === 0) return
		this.updateVec(vec)
	}, 10)

	attack = throttle(()=>{
		window.send({ type: 'attack', data: { facing: this.me.facing } })
	}, 500, {trailing: false})

	interact = throttle(()=>{
		let pos = add(this.me.pos, this.me.facing)
		window.send({ type: 'interact_map', data: { pos } })
	}, 500, {trailing: false})

	createFOV(){
		this.maskGraphics = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0 }});
		let mask = new Phaser.Display.Masks.GeometryMask(this, this.maskGraphics);
		mask.invertAlpha = true;

		this.fow = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 1 } });
		this.fow.setMask(mask);
		this.fow.fillRect(0, 0, this.map.heightInPixels, this.map.widthInPixels);


		this.viewableRange = this.add.circle(0, 0, 350, 0x000000, 0);
		let mask2 = new Phaser.Display.Masks.GeometryMask(this, this.viewableRange);
		mask2.invertAlpha = true;

		this.fovRange = this.add.graphics({ fillStyle: { color: 0, alpha: .85 } });
		this.fovRange.setMask(mask2);
		this.fovRange.fillRect(0, 0, this.map.heightInPixels, this.map.widthInPixels);
		this.fovRange.setDepth(40);
	}

	draw(){
		// remove this line if cast Circle
		this.intersections.push(this.ray.origin);

		this.maskGraphics.clear();
		//draw fov mask
		this.maskGraphics.fillPoints(this.intersections);

		this.viewableRange.setPosition(this.me.x, this.me.y);
	}

	updateFOV(){
		this.ray.setOrigin(this.me.x - this.me.facing?.[0] * 16, this.me.y - this.me.facing?.[1] * 16);

		this.ray.setConeDeg(90);
		// console.log(this.me.facing)
		if (this.me.facing){
			this.ray.setAngle(Math.atan2( this.me.facing[1], this.me.facing[0]))
		}
		//cast ray in a cone
		this.intersections = this.ray.castCone();

		// or cast ray in all directions
		// this.intersections = this.ray.castCircle();

		//redraw
		this.draw();
	}

	handleEvent(event: ClientMessage) {
		switch (event.type) {
			case 'init':
				const me = event.data.player

				event.data.players.forEach(player => {
					const playerText = player.identifier === me.identifier ? '我' : '他'
					const playerObj = new Player(this, playerText, player)
					this.players.set(player.identifier, playerObj)
				})

				this.me = this.players.get(me.identifier)!

				this.updateFOV()

				this.cameras.main.startFollow(this.me, true, 0.05, 0.05)
				break

			case 'join':
				const player = event.data.player
				const other = new Player(this, '他', player)
				this.players.set(player.identifier, other)
				break

			case 'move':
				const { identifier, pos, facing } = event.data
				const playerObj = this.players.get(identifier)
				if (!playerObj) break

				playerObj.setPositionTo( event.data.pos )
				playerObj.face(facing)

				if (identifier === this.me.identifier){
					this.updateFOV()
				}

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
					if (!attackerObj) break

					// show some light with weapon demageRange
					const { x, y, weapon, facing } = attackerObj
					const [fx, fy] = facing
					const angle = Math.atan2(fy, fx) * 180.0 / Math.PI
					for (const [rx, ry] of weapon.damageRange) {
						let rv = rotate([rx, ry], facing).map(v => v * 32) as Vec2
						// console.log(rx, ry, facing, rv, add([x,y], rv))
						let d = this.add.rectangle(...add(event.data.attacker_pos.map(x=>x*32+16) as Vec2, rv), 32, 32, 0x990000)
						d.angle = angle
						d.setDepth(3)
						let opacity: number = 1;
						setInterval(() => {
							d.setAlpha(opacity -= 0.1)
						}, 10)
						setTimeout(() => {
							d.destroy();
						}, 100);
					}
					for(const target of targets){
						const targetObj = this.players.get(target.identifier)
						if (!targetObj) continue
						let opacity: boolean = false
						let flash = setInterval(() => {
							targetObj.setAlpha(opacity? 1: 0.5)
							opacity = !opacity
						}, 50)
						setTimeout(()=>{
							clearInterval(flash)
							targetObj.setAlpha(1)
						}, 200)

					}
				}
				break

			case 'interact_map':
			case 'use':
				this.players.get(event.data.player.identifier)?.updatePlayer(event.data.player)
				break

			default:
		}
	}

	constructor() {
		super('GameScene')
	}

	preload() {
		this.load.image('lab_tiles', 'assets/images/lab.png')
		this.load.tilemapTiledJSON('map', JSON.parse(window.sessionStorage.getItem('map') ?? '{}'))
	}

	create() {
		
		// render the initial map
		this.map = this.make.tilemap({ key: 'map' })
		var tiles = this.map.addTilesetImage('Lab', 'lab_tiles', 32, 32, 0, 0)

		this.layer = this.map.createLayer('Ground', tiles, 0, 0)
		this.topLayer = this.map.createLayer('Top', tiles, 0, 0)

		this.physics.world.setBounds(0, 0, this.map.heightInPixels, this.map.widthInPixels)
		
		this.cameras.main.setBackgroundColor('#222222')

		this.cursors = this.input.keyboard.createCursorKeys()
		this.cursors.x = this.input.keyboard.addKey('X');

		this.players.clear()


		this.raycaster = this.raycasterPlugin.createRaycaster();
		this.ray = this.raycaster.createRay({autoSlice: false})

		//map tilemap layer
		this.raycaster.mapGameObjects(this.layer, false, {
			collisionTiles: [...Array(400).keys(), 416, 418, 446, 448, 450, 476, 478, 480] //array of tile types which collide with rays
		});


		// or cast ray in all directions
		// this.intersections = this.ray.castCircle();

		this.createFOV()
		this.topLayer.setDepth(4);
		this.fow.setDepth(2);

		this.updateFOV()

	}

	update(time: number, delta: number): void {

		// pop from event queue, then handle
		let event: ClientMessage | undefined
		while (event = window.events.shift())
			this.handleEvent(event)

		// attack
		if (this.input.keyboard.checkDown(this.cursors.space, 100)) {
			this.attack()
		}

		// interact
		if (this.input.keyboard.checkDown(this.cursors.x, 100)) {
			this.interact()
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
