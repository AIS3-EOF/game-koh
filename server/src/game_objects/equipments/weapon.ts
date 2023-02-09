import { Equipment } from './equipment'
import { Player } from '~/game'
import { Context } from '~/context'
import { Vec2 } from '~/protocol'
import { calcDistance, ChebyshevDistance } from '~/utils'

import * as 手刀 from './weapon/手刀'
import * as 半月刀 from './weapon/半月刀'
import * as 小太刀 from './weapon/小太刀'
import * as 風魔手裡劍 from './weapon/風魔手裡劍'
import * as Nyancat from './weapon/Nyancat'
import * as ㄐㄐ from './weapon/ㄐㄐ'
import * as 冰桶挑戰 from './weapon/冰桶挑戰'

import * as 認真手刀 from './weapon/認真手刀'

export enum WeaponType {
	'手刀' = '手刀',
	'半月刀' = '半月刀',
	'小太刀' = '小太刀',
	'風魔手裡劍' = '風魔手裡劍',
	'Nyancat' = 'Nyancat',
	'ㄐㄐ' = 'ㄐㄐ',
	'冰桶挑戰' = '冰桶挑戰',

	'認真手刀' = '認真手刀',
}

export interface WeaponDetail {
	identifier: string
	texture: string
	description: string
	can_transfer: boolean
	attack_modifier: number
	range: Vec2[]
	calc?: (
		attacker: Player,
		target: Player,
	) => { damage: number; effect: number }
	hit?: (ctx: Context) => void
}

const Weapons = new Map<WeaponType, WeaponDetail>([
	[WeaponType.手刀, 手刀],
	[WeaponType.半月刀, 半月刀],
	[WeaponType.小太刀, 小太刀],
	[WeaponType.風魔手裡劍, 風魔手裡劍],
	[WeaponType.Nyancat, Nyancat],
	[WeaponType.ㄐㄐ, ㄐㄐ],
	[WeaponType.冰桶挑戰, 冰桶挑戰],
	[WeaponType.認真手刀, 認真手刀],
])

export function generateWeapon() {
	const key = Object.keys(WeaponType)[
		Math.floor(Math.random() * Object.keys(WeaponType).length)
	] as keyof typeof WeaponType
	const type = WeaponType[key]
	return new Weapon(type)
}

export class Weapon extends Equipment {
	public range: Vec2[]
	constructor(public weapon_type: WeaponType = WeaponType.手刀) {
		super()
		this.identifier += '::Weapon::' + this.detail.identifier
		// TODO: Replace texture here
		this.texture = this.detail.texture ?? 'unknown_weapon'
		this.description = this.detail.description

		this.can_transfer = this.detail.can_transfer ?? true
		this.attack_modifier = this.detail.attack_modifier ?? 0
		this.range = this.detail.range
	}

	get detail() {
		return Weapons.get(this.weapon_type) ?? Weapons.get(WeaponType.手刀)!
	}

	use(ctx: Context) {
		super.use(ctx)

		if (ctx.player.removeObjectFromInventory(this)) {
			ctx.player.addObjectToInventory(ctx.player.current_weapon)
			ctx.player.current_weapon = this
		}
	}

	calc(attacker: Player, target: Player): { damage: number; effect: number } {
		if (this.detail.calc) return this.detail.calc(attacker, target)

		const dv = calcDistance(target.pos, attacker.pos, attacker.facing)
		const inside = this.range.some(rv => ChebyshevDistance(dv, rv) <= 0.5)

		/*  攻擊範圍 如

			地 地 刀 地
			人 刀 刀 刀
			地 地 刀 地

		    
			demageRange (range) 存
			[[0,1],[0,2],[0,3],[1,2],[-1,2]]

			地 地 地
			人 刀 地
			地 刀 地

		    
			demageRange (range) 存
			[[0,1], [1, 1]]

		*/

		let damage = 0,
			effect = 0
		if (inside)
			damage = Math.max(
				0,
				attacker.atk + this.attack_modifier - target.def,
			)
		return { damage, effect }
	}
}
