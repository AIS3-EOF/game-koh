import { Equipment } from "./equipment"
import { Player } from "@/game/player";
import { Context } from "@/context"
import { Vec2 } from "@/protocol/shared";
import { calcDistance, ChebyshevDistance } from '@/utils'

import * as 手刀 from './weapon/手刀'

export enum WeaponType {
    '手刀' = '手刀',
    '半月刀' = '半月刀',
    '小太刀' = '小太刀',
    '風魔手裡劍' = '風魔手裡劍',
    'Nyancat' = 'Nyancat',
    'ㄐㄐ' = 'ㄐㄐ',
    '冰桶挑戰' = '冰桶挑戰',
};

const Weapons = new Map([
    [WeaponType.手刀, 手刀],
    // [WeaponType.半月刀, 2],
    // [WeaponType.小太刀, 2],
    // [WeaponType.風魔手裡劍, 2],
    // [WeaponType.Nyancat, 1],
    // [WeaponType.ㄐㄐ, 2],
    // [WeaponType.冰桶挑戰, 2],
]);

export function generateWeapon() {
    const key = Object.keys(WeaponType)[Math.floor(Math.random() * Object.keys(WeaponType).length)] as keyof(typeof WeaponType)
    const type = WeaponType[key]
    return new Weapon(type)
}

export class Weapon extends Equipment {
    public range: Vec2[]
    constructor(
        public weapon_type: WeaponType = WeaponType.手刀
    ) {
        super();
        this.identifier += '::Weapon' + this.detail.identifier
        // TODO: Replace texture here
        this.texture = this.detail.texture ?? 'weapon';

        this.can_transfer = this.detail.can_transfer ?? true;
        this.attack_modifier = this.detail.attack_modifier ?? 0;
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

    calc(attacker: Player, target: Player): { damage: number, effect: number } {
        const dv = calcDistance(attacker.pos, target.pos, attacker.facing)
        const inside = this.range.some(rv => ChebyshevDistance(dv, rv) <= 0.5)

        // switch (this.weapon_type) {
        //     case WeaponType.手刀:
        //         inside =
        //         break
        //     case WeaponType.半月刀:
        //         inside = -TILE_SIZE*1.5 <= dx && dx <= TILE_SIZE*1.5 && -TILE_SIZE/2 <= dy && dy <= TILE_SIZE/2
        //         break
        //     case WeaponType.小太刀:
        //         inside = 0 <= dx && dx <= TILE_SIZE && -TILE_SIZE*1.5 <= dy && dy <= TILE_SIZE*1.5
        //         break
        //     case WeaponType.風魔手裡劍:
        //         inside = 0 <= dx && dx <= TILE_SIZE*5 && -TILE_SIZE/2 <= dy && dy <= TILE_SIZE/2
        //         break
        //     case WeaponType.Nyancat:
        //         inside = true
        //         break
        //     case WeaponType.ㄐㄐ:
        //         inside = 0 <= dx && dx <= TILE_SIZE*40 && -TILE_SIZE/2 <= dy && dy <= TILE_SIZE/2
        //         break
        //     case WeaponType.冰桶挑戰:
        //         inside = Math.max(Math.abs(dx), Math.abs(dy)) <= TILE_SIZE * 2
        //         break
        // }
        let damage = 0, effect = 0
        if (inside) {
            damage = attacker.atk + this.attack_modifier - target.def;
            if (this.weapon_type === WeaponType.Nyancat) {
                effect = damage;
            }
        }
        return { damage, effect };
    }
}
