import { Vec2 } from '~/protocol'
import { Player } from '~/game'
import { GameObject } from '~/game_objects/game_object'
import { Context } from '~/context'
import { MapObject } from './map_object'
import { randProb } from '../custom_rng/index'
import { randomUUID } from 'crypto'

import { debug } from 'debug'

const log = debug('server:MapObject:log')

export class Chest extends MapObject {
	chest_inventory: GameObject[] = []
	chest_inventory_rare: GameObject[] = []
	uuid: string = randomUUID()

	last_user: number = -1

	constructor(loc: Vec2) {
		super(loc)
		this.identifier += '::Chest'
		// TODO: Replace texture here
		this.texture = 'chest'
		this.can_walk = false
	}

	interact(ctx: Context, data: any) {
		super.interact(ctx, data)
	
		if (this.last_user == ctx.player.identifier) {
			ctx.send({
				type: 'chat',
				data: {
					from: '(server)',
					to: ctx.player.identifier,
					message: `輪流來好嗎，不要獨佔這個寶箱好不好 😤`,
				},
			})
			return
		}

		let new_items: GameObject[] = [];
		this.last_user = ctx.player.identifier
		// randomly pick one item and add to player inventroy and remove it from chest
		log(`Player ${ctx.player.identifier} opened Normal Chest`)
		const item = this.chest_inventory.splice(Math.floor(Math.random() * this.chest_inventory.length), 1)[0]
		if (item) {
			ctx.player.addObjectToInventory(item)
			new_items.push(item)
		}

		const seeds = Array.isArray(data) ? data : []
		if (randProb(this.uuid, seeds) >= 0.9) {
			log(`!!!!! Player ${ctx.player.identifier} opened Rare Chest.`)
			const item = this.chest_inventory_rare.splice(Math.floor(Math.random() * this.chest_inventory_rare.length), 1)[0]
			if (item) {
				ctx.player.addObjectToInventory(item)
				new_items.push(item)
			}
		}

		ctx.send({
			type: 'interact_chest',
			data: {
				new_items
			},
		})
	}
}
