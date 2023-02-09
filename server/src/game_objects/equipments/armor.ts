import { Equipment } from './equipment'
import { Context } from '~/context'
import { Player } from '~/game/'
import * as 麻布甲 from './armor/麻布甲'
import * as 鐵鎧甲 from './armor/鐵鎧甲'
import * as 海洛因褲子 from './armor/海洛因褲子'
import * as 破布 from './armor/破布'
import * as 魔法披風 from './armor/魔法披風'
import * as 暗夜之袍 from './armor/暗夜之袍'
import * as 日炎聖盾 from './armor/日炎聖盾'

export enum ArmorType {
	'無' = '無',
	'麻布甲' = '麻布甲',
	'鐵鎧甲' = '鐵鎧甲',
	'破布' = '破布',
	'魔法披風' = '魔法披風',
	'海洛因褲子' = '海洛因褲子',
	// '紫晶洞' = '紫晶洞',
	'暗夜之袍' = '暗夜之袍',
	'日炎聖盾' = '日炎聖盾',
}

export interface ArmorDetail {
	identifier: string
	texture: string
	can_transfer: boolean
	defense_modifier: number
	description: string
	is_rare?: boolean
	equip?: (player: Player) => void
	unequip?: (player: Player) => void
	tick?: (ctx: Context) => void
}

const Armors = new Map<ArmorType, ArmorDetail>([
	[
		ArmorType.無,
		{
			identifier: '無',
			texture: 'armor',
			can_transfer: false,
			defense_modifier: 0,
			description: "You're naked 🥵",
		},
	],
	[ArmorType.麻布甲, 麻布甲],
	[ArmorType.海洛因褲子, 海洛因褲子],
	[ArmorType.鐵鎧甲, 鐵鎧甲],
	[ArmorType.破布, 破布],
	[ArmorType.魔法披風, 魔法披風],
	[ArmorType.暗夜之袍, 暗夜之袍],
	[ArmorType.日炎聖盾, 日炎聖盾],
])

export function generateArmor(): Armor {
	const armor_type =
		Object.values(ArmorType)[
		Math.floor(Math.random() * Object.values(ArmorType).length)
		]

	if (armor_type === ArmorType.無) {
		return generateArmor()
	}

	return new Armor(armor_type)
}

export class Armor extends Equipment {
	constructor(public armor_type: ArmorType = ArmorType.無) {
		super()
		this.identifier += '::Armor::' + this.detail.identifier
		this.texture = this.detail.texture
		this.can_transfer = this.detail.can_transfer
		this.defense_modifier = this.detail.defense_modifier
		this.description = this.detail.description
		this.is_rare = this.detail.is_rare ?? false
	}

	get detail() {
		return Armors.get(this.armor_type) ?? Armors.get(ArmorType.無)!
	}

	use(ctx: Context) {
		super.use(ctx)

		ctx.player.current_armor.unequip(ctx)
		if (ctx.player.removeObjectFromInventory(this)) {
			if (ctx.player.current_armor.can_transfer) {
				ctx.player.addObjectToInventory(ctx.player.current_armor)
			}

			ctx.player.current_armor = this
			this.equip(ctx)
		}
	}

	equip(ctx: Context) {
		if (this.detail.equip) {
			this.detail.equip(ctx.player)
		}

		if (this.detail.tick) {
			eventQueue.manage('tick_object', {
				identifier: this.identifier + ctx.player.identifier,
				tick_count: 1,
				tick_fn: (tick: number) => { this.tick(ctx, tick) },
				forever: true
			})
		}
	}

	unequip(ctx: Context) {
		if (this.detail.unequip) {
			this.detail.unequip(ctx.player)
		}

		if (this.detail.tick) {
			eventQueue.manage('remove_tick_object', {
				identifier: this.identifier + ctx.player.identifier
			})
		}
	}

	tick(ctx: Context, tick: number) {
		if (this.detail.tick) {
			this.detail.tick(ctx)
		}
	}
}
