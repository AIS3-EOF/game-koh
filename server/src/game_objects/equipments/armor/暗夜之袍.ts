import { Player } from '~/game'

const ATK_BOOST: number = 10
const HP_BOOST: number = 50

export const identifier = '暗夜之袍'
export const texture = 'magic_cloak'
export const can_transfer = true
export const description = '傳說從某個手持雙刀的獨行玩家所流傳下來的裝備'
export const defense_modifier = 15


export function equip(player: Player) {
    player.addMaxHp(HP_BOOST)
    player.atk += ATK_BOOST
}

export function unequip(player: Player) {
    player.removeMaxHp(HP_BOOST)
    player.atk -= ATK_BOOST
}
