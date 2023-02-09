import { Player } from '~/game'
import { Context } from '~/context'


const ATK_BOOST: number = 5
const HP_BOOST: number = 5

export const identifier = '魔法披風'
export const texture = 'magic_cloak'
export const can_transfer = true
export const description = '有魔法加持的披風'
export const defense_modifier = 5


export function equip(player: Player) {
    player.addMaxHp(HP_BOOST)
    player.atk += ATK_BOOST
}

export function unequip(player: Player) {
    player.removeMaxHp(HP_BOOST)
    player.atk -= ATK_BOOST
}

export function tick(ctx: Context) {
}
