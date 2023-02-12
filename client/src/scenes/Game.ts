import Phaser from 'phaser'
import { throttle } from 'underscore'
import Player from '@/resources/Player'
import Weapon from '@/resources/Weapon'
import { InitIdentifier, SendFunction, ServerMessage, Vec2 } from '@/types'
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
			fillStyle: { color: 0x000000, alpha: 0 },
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
			fillStyle: { color: 0, alpha: 0 },
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

	cameraMap = new Map<Identifier, Phaser.Cameras.Scene2D.Camera>()
	revCameraMap = new WeakMap<Phaser.Cameras.Scene2D.Camera, Identifier>()
	addCamera(playerObj: Player) {
		if (this.cameraMap.has(playerObj.identifier)) return
		const camera = this.cameras
			.add()
			.setZoom(1)
			.startFollow(playerObj, true, 0.05, 0.05)
			.setVisible(false)
		this.cameraMap.set(playerObj.identifier, camera)
		this.revCameraMap.set(camera, playerObj.identifier)
		if (playerObj.identifier === this.focus)
			this.cameras.main.setVisible(true)
	}
	removeCamera(playerObj: Player) {
		const camera = this.cameraMap.get(playerObj.identifier)
		if (camera) {
			this.cameras.remove(camera)
			this.cameraMap.delete(playerObj.identifier)
			this.revCameraMap.delete(camera)
			camera.destroy()
		}
	}

	handleEvent(event: ClientMessage) {
		switch (event.type) {
			case 'init':
				const me = event.data.player

				event.data.players.forEach(player => {
					const playerText =
						player.identifier === me.identifier ? '站' : '戰'
					const playerObj = new Player(this, playerText, player)
					this.players.set(player.identifier, playerObj)
					this.addCamera(playerObj)
				})

				this.me = this.players.get(me.identifier)!
				this.updateFOV()
				// this.cameras.main.startFollow(this.me, true, 0.05, 0.05)
				break

			case 'join':
				{
					const player = event.data.player
					// console.log('join', player)
					const playerObj =
						this.players.get(player.identifier) ||
						new Player(this, '戰', player)
					playerObj.face(player.facing)
					playerObj.setPositionTo(player.pos)
					this.players.set(player.identifier, playerObj)
					this.addCamera(playerObj)
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

					playerObj.hp = player.hp
					playerObj.max_hp = player.max_hp
					playerObj.updateHpBar()
				}
				break

			case 'leave':
				{
					const { identifier } = event.data
					const playerObj = this.players.get(identifier)
					if (!playerObj) break

					playerObj.destroy()
					this.players.delete(identifier)
					this.removeCamera(playerObj)
				}
				break
			case 'move':
				const { identifier, pos, facing } = event.data
				const playerObj = this.players.get(identifier)
				if (!playerObj) break

				playerObj.face(facing)
				playerObj.setPositionTo(pos)

				break

			case 'attack':
				this.players
					.get(event.data.attacker)
					.attack(this, event.data.attacker_pos)

				break

			case 'damage': {
				const { player, damage } = event.data
				const playerObj = this.players.get(player.identifier)
				if (!playerObj) break
				playerObj.getDamage(this, damage, player)
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
	dom: EventTarget

	constructor() {
		super('GameScene')

		this.dom = window.gameDom!
		delete window.gameDom
		this.send = (msg: ServerMessage) => {
			this.dom.dispatchEvent(new CustomEvent('send', { detail: msg }))
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
		this.cursors.p = this.input.keyboard.addKey('P')
		this.cursors.f = this.input.keyboard.addKey('F')
		this.cursors.c = this.input.keyboard.addKey('C')
		this.cursors.r = this.input.keyboard.addKey('R')

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

		// create a camera for each player
		this.cameras.cameras.forEach(c => c.setVisible(false))
		this.cameras.cameras[0].setZoom(0.5)

		// focus on map center
		this.cameras.cameras[0].centerOn(
			this.map.widthInPixels / 2,
			this.map.heightInPixels / 2,
		)

		this.cameras.cameras[0].setVisible(true)

		this.switchCamera(Number(localStorage.getItem('cameraDir') ?? 1))
		this.focus = JSON.parse(
			localStorage.getItem('focus') ?? JSON.stringify(InitIdentifier),
		)
	}

	timeout: ReturnType<typeof setTimeout> | undefined
	cameraDir = 1
	focus: Identifier = InitIdentifier
	follow: Identifier = InitIdentifier

	switchCamera(dir?: number) {
		if (dir !== undefined) {
			this.cameraDir = dir
			localStorage.setItem('cameraDir', dir.toString())
			this.focus = InitIdentifier
			localStorage.setItem('focus', JSON.stringify(this.focus))
		}

		if (this.timeout) clearTimeout(this.timeout)
		if (this.focus !== InitIdentifier) return
		const { cameras } = this.cameras

		const current = cameras.findIndex(c => c.visible)
		const next =
			(current + this.cameraDir + cameras.length) % cameras.length
		let identifier = this.revCameraMap.get(cameras[next]) ?? InitIdentifier

		// current === -1 means no camera is visible
		cameras[current]?.setVisible(false)
		cameras[next].setVisible(true)
		this.follow = identifier

		this.dom.dispatchEvent(
			new CustomEvent('switch_camera', { detail: { identifier } }),
		)

		this.timeout = setTimeout(this.switchCamera.bind(this), 5000)
	}

	update(time: number, delta: number): void {
		// pop from event queue, then handle
		let event: ClientMessage | undefined
		while ((event = this.events_pool.shift())) this.handleEvent(event)

		if (this.input.keyboard.checkDown(this.cursors.space, 500))
			this.switchCamera()
		if (this.input.keyboard.checkDown(this.cursors.right, 500))
			this.switchCamera(1)
		if (this.input.keyboard.checkDown(this.cursors.left, 500))
			this.switchCamera(-1)
		if (Phaser.Input.Keyboard.JustDown(this.cursors.p)) this.switchCamera(0)
		if (Phaser.Input.Keyboard.JustDown(this.cursors.f)) {
			this.focus = this.follow
			localStorage.setItem('focus', JSON.stringify(this.focus))
			this.switchCamera(0)
		}
		if (Phaser.Input.Keyboard.JustDown(this.cursors.c)) localStorage.clear()
		if (Phaser.Input.Keyboard.JustDown(this.cursors.r)) location.reload()
	}
}
