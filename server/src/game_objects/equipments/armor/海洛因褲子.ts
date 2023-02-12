import { Player } from '~/game'

const ATK_BOOST: number = 10

export const identifier = '海洛因褲子'
export const texture = 'heroin_pants'
export const can_transfer = true
export const description = '用海洛因製成的褲子，穿上它攻擊力會巨幅提升，但自身會變得極其脆弱'
export const defense_modifier = -50


export function equip(player: Player) {
    player.dealDamageFrom(player.hp - 10, player.identifier)
    player.atk += ATK_BOOST
}

export function unequip(player: Player) {
    player.dealDamageFrom(10000, player.identifier)
    // player should be dead, we don't have to reset player's attribute here
}
