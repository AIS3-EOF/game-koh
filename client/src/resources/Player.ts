import { Vec2, GameObject, PlayerPub, Identifier } from '@/types'
import Weapon from './Weapon'

export default class Player extends Phaser.GameObjects.Container {
	public playerText: Phaser.GameObjects.Text
	public graphics: Phaser.GameObjects.Graphics
	public facing: Vec2 = [0, 1]
	public identifier: Identifier
	public pos: Vec2
	public weapon: Weapon
	public inventory: GameObject[]

	constructor(scene: Phaser.Scene, text: string, player: PlayerPub) {
		const playerText = scene.add.text(0, 0, text, { color: 'white' })
		playerText.setOrigin(0.5)
		super(scene, ...player.pos.map((x: number) => x * 32 + 16), playerText) // The frame is optional
		this.scene.add.existing(this)

		this.setSize(20, 20)

		scene.physics.world.enable(this)
		// this.body.setCollideWorldBounds(true);

		this.updatePlayer(player)

		const graphics = scene.add.graphics()
		graphics.clear()
		graphics.lineStyle(2, 0x009900, 1)
		graphics.beginPath()
		graphics.moveTo(0, 0)
		graphics.lineTo(0, (this.height + 30) / 2)
		graphics.strokePath()
		graphics.closePath()
		graphics.setPosition(player.pos[0] * 32 + 16, player.pos[1] * 32 + 16)

		this.graphics = graphics
	}

	updatePlayer(player: PlayerPub) {
		this.identifier = player.identifier
		this.weapon = new Weapon(
			player.current_weapon.weapon_type,
			player.current_weapon.range,
		)
		this.inventory = player.inventory
		this.face(player.facing)
		this.setPositionTo(player.pos)
	}

	face(facing: Vec2) {
		this.facing = facing
	}

	setPositionTo(pos: Vec2) {
		this.pos = pos
		this.setPosition(...pos.map((x: number) => x * 32 + 16))
		this.graphics?.setPosition(...pos.map((x: number) => x * 32 + 16))

		// this.scene.tweens.add({
		// 	targets: [this, this.graphics],
		// 	x: pos[0] * 32 + 16,
		// 	y: pos[1] * 32 + 16,
		// 	duration: 150,
		// 	ease: 'Linear'
		// })

		// rotate graphics
		const [fx, fy] = this.facing
		this.graphics?.setAngle(Math.atan2(-fx, fy) * (180 / Math.PI))
	}

	destroy(fromScene?: boolean | undefined): void {
		this.graphics.destroy()
		super.destroy(fromScene)
	}

	setVisible(visible: boolean) {
		this.graphics.setVisible(visible)
		super.setVisible(visible)
		return this
	}
}
