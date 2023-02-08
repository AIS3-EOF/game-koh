import { Player } from '~/game'

const HP_BOOST: number = 5

export const identifier = '海洛因褲子'
export const texture = 'heroin_pant'
export const can_transfer = true
export const description = '用海洛因製成的褲子，穿上它攻擊力會巨幅提升，但自身會變得極其脆弱'
export const defense_modifier = -10


export function equip(player: Player) {
    player.dealDamageFrom(player.hp - 1, player.identifier)
    player.atk += 10
}

export function unequip(player: Player) {
    player.dealDamageFrom(10000, player.identifier)
    // player should be dead, we don't have to reset player's attribute here
}
