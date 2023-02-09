import { GameObject } from '../game_object'
import { Context } from '~/context'
import * as RecoveryPotion from './item/回復藥水'
import * as Dynamite from './item/地獄火強襲'
import * as GrowPotion from './item/成長藥水'
import * as StrengthPotion from './item/傷害藥水'
import * as LOIC from './item/LOIC'
import * as WorldEnder from './item/World-Ender'


export interface ItemDetail {
	identifier: string
	texture: string
	description: string
	isRare?: boolean

	// One-time effect
	use: (item: Item, ctx: Context) => void

	// For item that has duration
	total_tick?: number
	used_tick?: number
	tick?: (item: Item, ctx: Context) => void
	end?: (item: Item, ctx: Context) => void
}

export enum ItemType {
	'None' = 'None',
	'RecoveryPotion' = 'RecoveryPotion',
	'Dynamite' = 'Dynamite',
	'StrengthPotion' = 'StrengthPotion',
	'GrowPotion' = 'GrowPotion',
	'LOIC' = 'LOIC',
	'WorldEnder' = 'WorldEnder'
}

const Items = new Map<ItemType, ItemDetail>([
	[ItemType.None, {
		identifier: 'DummyItem',
		texture: 'dummy_item',
		description: 'No effect, just a dummy',
		use: (item, ctx) => { }
	}],
	[ItemType.RecoveryPotion, RecoveryPotion],
	[ItemType.Dynamite, Dynamite],
	[ItemType.StrengthPotion, StrengthPotion],
	[ItemType.GrowPotion, GrowPotion],
	[ItemType.LOIC, LOIC],
	[ItemType.WorldEnder, WorldEnder]
])

export function generateItem(): Item {
	const type =
		Object.values(ItemType)[
		Math.floor(Math.random() * Object.values(ItemType).length)
		]

	if (type === ItemType.None) {
		return generateItem()
	}

	return new Item(type)
}

export class Item extends GameObject {
	total_tick: number
	extra_data: any

	constructor(public item_type: ItemType = ItemType.None) {
		super()
		this.identifier += '::Item::' + this.detail.identifier
		this.texture = this.detail.texture
		this.description = this.detail.description ?? 'If you see this message, please blame the staffs for not implementing the item properly'
		this.total_tick = this.detail.total_tick ?? 0

		this.isRare = this.detail.isRare ?? false
	}

	get detail() {
		return Items.get(this.item_type) ?? Items.get(ItemType.None)!
	}

	use(ctx: Context) {
		super.use(ctx)
		if (ctx.player.removeObjectFromInventory(this)) {
			this.detail.use(this, ctx)

			if (this.detail.tick) {
				eventQueue.manage('tick_object', {
					identifier: this.identifier,
					tick_count: this.total_tick,
					tick_fn: (tick: number) => this.tick(ctx, tick)
				})
			}
		}
	}

	tick(ctx: Context, tick: number) {
		if (tick == 0) {
			if (this.detail.end) {
				this.detail.end(this, ctx)
			}
			return
		}

		if (this.detail.tick) {
			this.detail.tick(this, ctx)
		}
	}
}
