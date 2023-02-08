import { Player } from '~/game'

const HP_BOOST: number = 5

export const identifier = '麻布甲'
export const texture = 'weed_bo'
export const can_transfer = true
export const description = '大麻製成的布甲，會給予些許血量提升'
export const defense_modifier = 0

export function equip(player: Player) {
	player.addMaxHp(HP_BOOST)
}

export function unequip(player: Player) {
	player.removeMaxHp(HP_BOOST)
}
