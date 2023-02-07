import { Vec2 } from '~/protocol'
import { Player } from '~/game'
import { GameObject } from '~/game_objects/game_object'
import { Context } from '~/context'
import { MapObject } from './map_object'
import { randProb } from '../custom_rng/index'

import { debug } from 'debug'

const log = debug('server:MapObject')

export class Chest extends MapObject {
	chest_inventory: GameObject[] = []
	chest_inventory_rare: GameObject[] = []

	constructor(loc: Vec2) {
		super(loc)
		this.identifier += '::Chest'
		// TODO: Replace texture here
		this.texture = 'chest'
		this.can_walk = false
	}

	interact(ctx: Context, data: any) {
		super.interact(ctx, data)

		ctx.player.inventory.push(...this.chest_inventory)
		this.chest_inventory = []

		const seeds = Array.isArray(data) ? data : []
		if (randProb(ctx.player.identifier, seeds) >= 0.85) {
			ctx.player.inventory.push(...this.chest_inventory_rare)
			this.chest_inventory_rare = []
		}
	}
}
