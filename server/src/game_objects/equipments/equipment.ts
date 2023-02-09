import { Context } from '~/context'
import { GameObject } from '../game_object'

export class Equipment extends GameObject {
	attack_modifier: number = 0
	defense_modifier: number = 0
	can_transfer: boolean = true // Will the equipment be transfered to player's inventory when being replaced
	is_rare: boolean = false

	constructor() {
		super()
		this.identifier += '::Equipment'
		this.texture = 'equipment'
		this.description = 'This is an equipment'
	}
}
