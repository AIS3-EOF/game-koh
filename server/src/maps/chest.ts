import { Vec2 } from '~/protocol'
import { Player } from '~/game'
import { GameObject } from '~/game_objects/game_object'
import { Context } from '~/context'
import { MapObject } from './map_object'
import { randProb } from '../custom_rng/index'
import { randomUUID } from 'crypto'

import { debug } from 'debug'

const log = debug('server:MapObject')

export class Chest extends MapObject {
	chest_inventory: GameObject[] = []
	chest_inventory_rare: GameObject[] = []
	uuid: string = randomUUID()

	constructor(loc: Vec2) {
		super(loc)
		this.identifier += '::Chest'
		// TODO: Replace texture here
		this.texture = 'chest'
		this.can_walk = false
	}

	interact(ctx: Context, data: any) {
		super.interact(ctx, data)

		let new_items: GameObject[] = [];

		this.chest_inventory.forEach((item) => {
			ctx.player.addObjectToInventory(item)
		})
		new_items.push(...this.chest_inventory)
		this.chest_inventory = []

		const seeds = Array.isArray(data) ? data : []
		if (randProb(this.uuid, seeds) >= 0.9) {
			this.chest_inventory_rare.forEach((item) => {
				ctx.player.addObjectToInventory(item)
			})
			new_items.push(...this.chest_inventory)
			this.chest_inventory_rare = []
			log(`!!!Player ${ctx.player.identifier} opened Rare Chest!!!`)
		}

		ctx.send({
			type: 'interact_chest',
			data: {
				new_items
			},
		})
	}
}
