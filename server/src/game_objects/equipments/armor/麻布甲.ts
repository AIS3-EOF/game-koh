import { Player } from '~/game'

const HP_BOOST: number = 5

export const identifier = '麻布甲'
export const texture = 'armor'
export const can_transfer = true
export const defense_modifier = 0

export function equip(player: Player) {
	player.addMaxHp(HP_BOOST)
}

export function unequip(player: Player) {
	player.removeMaxHp(HP_BOOST)
}
