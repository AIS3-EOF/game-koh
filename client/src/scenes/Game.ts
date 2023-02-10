import Phaser from 'phaser'
import { throttle } from 'underscore'
import Player from '@/resources/Player'
import Weapon from '@/resources/Weapon'
import { SendFunction, ServerMessage, Vec2 } from '@/types'
import { rotate, add } from '~/utils'
import { ClientMessage, Identifier } from '@/types'

export default class Game extends Phaser.Scene {
	layer: any
	topLayer: any
	map: any
	players = new Map<Identifier, Player>()
	me = {} as Player
	cursors: any
	tickCallbacks = new Set<Function>()

	raycaster: any
	ray: any
	intersections: any
	graphics: any
	maskGraphics: any
	fow: any
	fovRange: any
	viewableRange: any

	updateVec = throttle(
		(vec: Vec2) => {
			if (typeof this.me.face !== 'function') {
				return location.reload()
			}
			// me.setPosition(me.x + vec[0], me.y + vec[1])
			this.me.face(vec)
			let newPos = add(this.me.pos, vec)

			this.send({ type: 'move', data: { vec, facing: this.me.facing } })
		},
		150,
		{ trailing: false },
	)

	faceAry: Vec2[] = []
	updateFace = throttle(() => {
		const vec = this.faceAry.reduce(
			(acc, cur) => [acc[0] || cur[0], acc[1] || cur[1]],
			[0, 0],
		)
		this.faceAry = []
		if (vec[0] === 0 && vec[1] === 0) return
		this.updateVec(vec)
	}, 10)

	attack = throttle(
		() => {
			this.send({ type: 'attack', data: { facing: this.me.facing } })
		},
		500,
		{ trailing: false },
	)

	interact = throttle(
		() => {
			let pos = add(this.me.pos, this.me.facing)
			this.send({ type: 'interact_map', data: { pos } })
		},
		500,
		{ trailing: false },
	)

	createFOV() {
		this.maskGraphics = this.add.graphics({
			fillStyle: { color: 0xffffff, alpha: 0 },
		})
		let mask = new Phaser.Display.Masks.GeometryMask(
			this,
			this.maskGraphics,
		)
		mask.invertAlpha = true

		this.fow = this.add.graphics({
			fillStyle: { color: 0x000000, alpha: 1 },
		})
		this.fow.setMask(mask)
		this.fow.fillRect(0, 0, this.map.heightInPixels, this.map.widthInPixels)

		this.viewableRange = this.add.circle(0, 0, 350, 0x000000, 0)
		let mask2 = new Phaser.Display.Masks.GeometryMask(
			this,
			this.viewableRange,
		)
		mask2.invertAlpha = true

		this.fovRange = this.add.graphics({
			fillStyle: { color: 0, alpha: 0.85 },
		})
		this.fovRange.setMask(mask2)
		this.fovRange.fillRect(
			0,
			0,
			this.map.heightInPixels,
			this.map.widthInPixels,
		)
		this.fovRange.setDepth(40)
	}

	draw() {
		// remove this line if cast Circle
		this.intersections.push(this.ray.origin)

		this.maskGraphics.clear()
		//draw fov mask
		this.maskGraphics.fillPoints(this.intersections)
	}

	updateFOV() {
		const updateOnce = () => {
			this.ray.setOrigin(
				this.me.x - this.me.facing?.[0] * 15,
				this.me.y - this.me.facing?.[1] * 15,
			)
			this.ray.setConeDeg(90)
			if (this.me.facing) {
				this.ray.setAngle(
					Math.atan2(this.me.facing[1], this.me.facing[0]),
				)
			}
			this.intersections = this.ray.castCone()
			this.draw()
		}
		this.tweens.add({
			targets: this.viewableRange,
			x: this.me.x || 0,
			y: this.me.y || 0,
			duration: 150,
			ease: 'Linear',
			onStart: updateOnce,
			// // animated raycast
			// onUpdate: (tween: any, target: any) => {
			// 	if (
			// 		// (tween.elapsed > 25 && tween.elapsed < 30) ||
			// 		// (tween.elapsed > 55 && tween.elapsed < 60) ||
			// 		// (tween.elapsed > 85 && tween.elapsed < 90) ||
			// 		// (tween.elapsed > 115 && tween.elapsed < 120) ||
			// 		// (tween.elapsed > 145 && tween.elapsed < 150)
			// 	) {
			// 		updateOnce()
			// 	}
			// },
			onComplete: updateOnce,
		})
	}

	handleEvent(event: ClientMessage) {
		switch (event.type) {
			case 'init':
				const me = event.data.player

				event.data.players.forEach(player => {
					const playerText =
						player.identifier === me.identifier ? '我' : '他'
					const playerObj = new Player(this, playerText, player)
					this.players.set(player.identifier, playerObj)
				})

				this.me = this.players.get(me.identifier)!
				this.updateFOV()
				this.cameras.main.startFollow(this.me, true, 0.05, 0.05)
				break

			case 'join':
				{
					const player = event.data.player
					// console.log('join', player)
					const playerObj =
						this.players.get(player.identifier) ||
						new Player(this, '他', player)
					playerObj.face(player.facing)
					playerObj.setPositionTo(player.pos)
					this.players.set(player.identifier, playerObj)
				}
				break

			case 'respawn':
				{
					const { player } = event.data
					const playerObj = this.players.get(player.identifier)
					if (!playerObj) break

					playerObj.face(player.facing)
					playerObj.setPositionTo(player.pos)

					playerObj.setVisible(true)

					if (player.identifier === this.me.identifier) {
						this.updateFOV()
						this.cameras.main.startFollow(this.me, true, 0.05, 0.05)
					}
				}
				break

			case 'leave':
				{
					const { identifier } = event.data
					const playerObj = this.players.get(identifier)
					if (!playerObj) break

					playerObj.destroy()
					this.players.delete(identifier)
				}
				break
			case 'move':
				const { identifier, pos, facing } = event.data
				const playerObj = this.players.get(identifier)
				if (!playerObj) break

				playerObj.face(facing)
				playerObj.setPositionTo(pos)

				if (identifier === this.me.identifier) {
					this.updateFOV()
				}

				break

			case 'attack':
				{
					const { attacker, targets } = event.data
					const attackerObj = this.players.get(attacker)
					if (!attackerObj) break

					// show some light with weapon demageRange
					const { x, y, weapon, facing } = attackerObj
					const [fx, fy] = facing
					const angle = (Math.atan2(fy, fx) * 180.0) / Math.PI
					for (const [rx, ry] of weapon.damageRange) {
						let rv = rotate([rx, ry], facing).map(
							v => v * 32,
						) as Vec2
						// console.log(rx, ry, facing, rv, add([x,y], rv))
						let d = this.add.rectangle(
							...add(
								event.data.attacker_pos.map(
									x => x * 32 + 16,
								) as Vec2,
								rv,
							),
							32,
							32,
							0x990000,
						)
						d.angle = angle
						d.setDepth(3)
						let opacity: number = 1
						setInterval(() => {
							d.setAlpha((opacity -= 0.1))
						}, 10)
						setTimeout(() => {
							d.destroy()
						}, 100)
					}
					for (const target of targets) {
						const targetObj = this.players.get(target.identifier)
						if (!targetObj) continue
						let opacity: boolean = false
						let flash = setInterval(() => {
							targetObj.setAlpha(opacity ? 1 : 0.5)
							opacity = !opacity
						}, 50)
						setTimeout(() => {
							clearInterval(flash)
							targetObj.setAlpha(1)
						}, 200)
					}
				}
				break

			case 'damage': {
				const { identifier, pos, damage } = event.data
				const text = this.add
					.text(
						pos[0] * 32 + 16 + 12,
						pos[1] * 32 + 16 - 12,
						damage.toString(),
						{
							fontSize: '16px',
							color: '#ff0000',
						},
					)
					.setDepth(100)
					.setOrigin(0.5, 0.5)
				setTimeout(() => text.destroy(), 300)
				break
			}

			case 'death':
				{
					let deathScreen: Phaser.GameObjects.Rectangle
					let deathTexts: Phaser.GameObjects.Text[]

					const {
						victim_identifier,
						attacker_identifier,
						respawn_time,
					} = event.data
					const victim = this.players.get(victim_identifier)
					if (!victim) break
					if (victim_identifier === this.me.identifier) {
						this.cameras.main.shake(1000, 0.01)
						this.cameras.main.stopFollow()

						deathScreen = this.add
							.rectangle(
								0,
								0,
								this.map.heightInPixels,
								this.map.widthInPixels,
								0x000000,
								0.5,
							)
							.setDepth(100)
							.setOrigin(0, 0)

						const attacker_name =
							this.players.get(attacker_identifier)?.name ??
							'unknown'
						console.log({
							attacker_identifier,
							attacker_name,
							attacker: this.players.get(attacker_identifier),
						})
						deathTexts = [
							this.add
								.text(this.me.x, this.me.y - 32, 'You died', {
									fontSize: '128px',
									color: '#ff0000',
								})
								.setDepth(101)
								.setOrigin(0.5, 0.5),
							this.add
								.text(
									this.me.x,
									this.me.y + 128 - 32,
									`Killed by ${attacker_name}`,
									{
										fontSize: '64px',
										color: '#ffffff',
									},
								)
								.setDepth(101)
								.setOrigin(0.5, 0.5),
							this.add
								.text(
									this.me.x,
									this.me.y + 128 + 64 + 20 - 32,
									`Respawn in ${respawn_time} seconds`,
									{
										fontSize: '64px',
										color: '#ffffff',
									},
								)
								.setDepth(101)
								.setOrigin(0.5, 0.5),
						]

						let respawn_time_cnt = respawn_time
						const func = () =>
							deathTexts[2].setText(
								`Respawn in ${--respawn_time_cnt} seconds`,
							)
						this.tickCallbacks.add(func)
						setTimeout(
							() => this.tickCallbacks.delete(func),
							(respawn_time - 0.5) * 1000,
						)
					}

					const handler = setInterval(() => {
						victim.setAlpha(victim.alpha === 1 ? 0.25 : 1)
					}, 200)

					setTimeout(() => {
						victim.setAlpha(1)
						victim.setVisible(false)
						clearInterval(handler)

						// draw blood on the ground
						const deadBody = this.add
							.text(victim.x, victim.y, '死', {
								fontSize: '16px',
								color: '#ff0000',
							})
							.setOrigin(0.5, 0.5)
							.setDepth(100)

						// scale up and scale down once
						this.tweens.add({
							targets: deadBody,
							scale: 5,
							duration: 500,
							ease: 'Power2',
							yoyo: true,
							onComplete: () =>
								deadBody.setDepth(0).setText('屍'),
						})
					}, 1400)

					setTimeout(() => {
						if (deathScreen) {
							deathScreen.destroy()
							deathTexts.forEach(t => t.destroy())
						}
					}, (respawn_time - 0.5) * 1000)
				}
				break

			case 'interact_chest':
				const { new_items } = event.data
				const message = this.add
					.text(
						this.me.x,
						this.me.y - 32,
						new_items.length > 0
							? `你獲得了 ${new_items
									.map(i => i.identifier.split('::').at(-1))
									.join(', ')}`
							: '這裡還沒有物資...',
						{ fontSize: '16px', color: '#ffffff' },
					)
					.setDepth(100)
					.setOrigin(0.5, 0.5)
				setTimeout(() => message.destroy(), 2000)

				break
			case 'interact_map':
			case 'use':
				this.players
					.get(event.data.player.identifier)
					?.updatePlayer(event.data.player)
				break

			case 'tick':
				this.tickCallbacks.forEach(cb => cb(event.data))
				break

			default:
		}
	}

	send: SendFunction = () => {}
	events_pool: ClientMessage[] = []

	constructor() {
		super('GameScene')

		const dom = window.gameDom
		delete window.gameDom
		this.send = (msg: ServerMessage) => {
			dom?.dispatchEvent(new CustomEvent('send', { detail: msg }))
		}
		this.events_pool = window.gameEvents!
		delete window.gameEvents
	}

	preload() {
		this.load.image('lab_tiles', 'assets/images/lab.png')
		this.load.tilemapTiledJSON(
			'map',
			JSON.parse(window.sessionStorage.getItem('map') ?? '{}'),
		)
	}

	create() {
		// render the initial map
		this.map = this.make.tilemap({ key: 'map' })
		var tiles = this.map.addTilesetImage('Lab', 'lab_tiles', 32, 32, 0, 0)

		this.layer = this.map.createLayer('Ground', tiles, 0, 0)
		this.topLayer = this.map.createLayer('Top', tiles, 0, 0)

		this.physics.world.setBounds(
			0,
			0,
			this.map.heightInPixels,
			this.map.widthInPixels,
		)

		this.cameras.main.setBackgroundColor('#222222')

		this.cursors = this.input.keyboard.createCursorKeys()
		this.cursors.x = this.input.keyboard.addKey('X')

		this.players.clear()

		this.raycaster = this.raycasterPlugin.createRaycaster()
		this.ray = this.raycaster.createRay({ autoSlice: false })

		//map tilemap layer
		this.raycaster.mapGameObjects(this.layer, false, {
			collisionTiles: [
				...Array(400).keys(),
				416,
				418,
				446,
				448,
				450,
				476,
				478,
				480,
			], //array of tile types which collide with rays
		})

		// or cast ray in all directions
		// this.intersections = this.ray.castCircle();

		this.createFOV()
		this.topLayer.setDepth(4)
		this.fow.setDepth(2)

		this.updateFOV()
	}

	update(time: number, delta: number): void {
		// pop from event queue, then handle
		let event: ClientMessage | undefined
		while ((event = this.events_pool.shift())) this.handleEvent(event)

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
			this.cursors.down.isDown - this.cursors.up.isDown,
		] as Vec2
		if (vec.some(Boolean)) {
			this.faceAry.push(vec)
			this.updateFace()
		}
	}
}
