import { Equipment } from "./equipment"
import { Context } from "@/context"

export function generateArmor() {
    return new Armor();
}

export enum ArmorType {
    '麻布甲' = '麻布甲',
    '鐵鎧甲' = '鐵鎧甲',
    '破布' = '破布',
    '魔法披風' = '魔法披風',
    '大麻褲子' = '大麻褲子',
    '紫晶洞' = '紫晶洞',
    '暗夜之袍' = '暗夜之袍',
};

export class Armor extends Equipment {
    constructor() {
        super();
        // TODO: add armor type
        this.identifier += '::Armor::' + 'TYPE';
        // TODO: Replace texture here
        this.texture = 'armor';

        this.can_transfer = false;
        this.defense_modifier = 1;
    }


    use(ctx: Context) {
        super.use(ctx)

        if (ctx.player.removeObjectFromInventory(this)) {
            ctx.player.addObjectToInventory(ctx.player.current_armor)
            ctx.player.current_armor = this
        }
    }
}
