import { Vec2, GameObject, PlayerPub, Identifier } from '@/types'
import Weapon from './Weapon'

export default class Player extends Phaser.GameObjects.Container {
	public playerText: Phaser.GameObjects.Text
	public facingLine: Phaser.GameObjects.Graphics
	public hpBar: Phaser.GameObjects.Graphics
	public facing: Vec2 = [0, 1]
	public identifier: Identifier
	public name: string
	public pos: Vec2
	public weapon: Weapon
	public inventory: GameObject[]
	public hp: number = 10
	public max_hp: number = 10

	constructor(scene: Phaser.Scene, text: string, player: PlayerPub) {
		const playerText = scene.add.text(0, 0, text, { color: 'blue' })
		playerText.setOrigin(0.5)
		super(scene, ...player.pos.map((x: number) => x * 32 + 16), playerText) // The frame is optional
		this.scene.add.existing(this)

		this.hpBar = scene.add.graphics()

		this.setSize(20, 20)

		scene.physics.world.enable(this)
		// this.body.setCollideWorldBounds(true);

		this.updatePlayer(player)

		const facingLine = scene.add.graphics()
		facingLine.clear()
		facingLine.lineStyle(2, 0x009900, 1)
		facingLine.beginPath()
		facingLine.moveTo(0, 0)
		facingLine.lineTo(0, (this.height + 30) / 2)
		facingLine.strokePath()
		facingLine.closePath()
		facingLine.setPosition(player.pos[0] * 32 + 16, player.pos[1] * 32 + 16)

		this.facingLine = facingLine
		this.updateHpBar()
	}

	updatePlayer(player: PlayerPub) {
		this.identifier = player.identifier
		this.name = player.name
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
		this.facingLine?.setPosition(...pos.map((x: number) => x * 32 + 16))

		// this.scene.tweens.add({
		// 	targets: [this, this.facingLine],
		// 	x: pos[0] * 32 + 16,
		// 	y: pos[1] * 32 + 16,
		// 	duration: 150,
		// 	ease: 'Linear'
		// })

		// rotate facingLine
		const [fx, fy] = this.facing
		this.facingLine?.setAngle(Math.atan2(-fx, fy) * (180 / Math.PI))
		this.hpBar?.setPosition(...pos.map((x: number) => x * 32))
	}

	updateHpBar() {
		const offsetX = 6
		const offsetY = -3
		const hpBarHeight = 6
		const hpBarWidth = 20
		const hpBarBorderWidth = 1

		this.hpBar.clear()

		//  BG
		this.hpBar.fillStyle(0x000000)
		this.hpBar.fillRect(
			offsetX,
			offsetY,
			hpBarWidth + hpBarBorderWidth * 2,
			hpBarHeight + hpBarBorderWidth * 2,
		)

		//  Health

		this.hpBar.fillStyle(0xffffff)
		this.hpBar.fillRect(
			offsetX + hpBarBorderWidth,
			offsetY + hpBarBorderWidth,
			hpBarWidth,
			hpBarHeight,
		)

		if (this.max_hp - this.hp >= this.max_hp * 0.7) {
			this.hpBar.fillStyle(0xff0000)
		} else {
			this.hpBar.fillStyle(0x00ff00)
		}

		var width = Math.floor(hpBarWidth * (this.hp / this.max_hp))

		this.hpBar.fillRect(
			offsetX + hpBarBorderWidth,
			offsetY + hpBarBorderWidth,
			width,
			hpBarHeight,
		)
	}

	getDamage(scene: Phaser.Scene, damage: number, player: object) {
		const text = scene.add
			.text(this.x + 12, this.y - 12, damage.toString(), {
				fontSize: '18px',
				color: '#ff0000',
			})
			.setDepth(100)
			.setOrigin(0.5, 0.5)
		const borderedText = scene.add
			.text(this.x + 12, this.y - 12, damage.toString(), {
				fontSize: '22px',
				color: '#000000',
			})
			.setDepth(99)
			.setOrigin(0.5, 0.5)
		scene.tweens.add({
			targets: [text, borderedText],
			y: this.y - 32,
			duration: 300,
			ease: 'Linear',
		})

		setTimeout(() => [text, borderedText].forEach(e => e.destroy()), 300)

		// update health
		this.hp = player.hp
		this.max_hp = player.max_hp
		this.updateHpBar()
	}

	destroy(fromScene?: boolean | undefined): void {
		this.facingLine.destroy()
		super.destroy(fromScene)
	}

	setVisible(visible: boolean) {
		this.facingLine.setVisible(visible)
		super.setVisible(visible)
		return this
	}
}
