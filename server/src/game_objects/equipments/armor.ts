import { Equipment } from "./equipment"
import { Context } from "~/context"
import { Player } from "~/game/"
import * as 麻布甲 from "./armor/麻布甲"


export enum ArmorType {
    '無' = '無',
    '麻布甲' = '麻布甲',
    // '鐵鎧甲' = '鐵鎧甲',
    // '破布' = '破布',
    // '魔法披風' = '魔法披風',
    // '大麻褲子' = '大麻褲子',
    // '紫晶洞' = '紫晶洞',
    // '暗夜之袍' = '暗夜之袍',
};

export interface ArmorDetail {
    identifier: string
    texture: string
    can_transfer: boolean
    defense_modifier: number
    equip?: (player: Player) => void
    unequip?: (player: Player) => void
}

const Armors = new Map<ArmorType, ArmorDetail>([
    [ArmorType.無, {'identifier': '無', 'texture': 'armor', 'can_transfer': false, 'defense_modifier': 0}],
    [ArmorType.麻布甲, 麻布甲],
]);

export function generateArmor(): Armor {
    const armor_type = Object.values(ArmorType)[Math.floor(Math.random() * Object.values(ArmorType).length)]
    
    if (armor_type === ArmorType.無) {
        return generateArmor()
    }

    return new Armor(armor_type)
}

export class Armor extends Equipment {
    constructor(
        public armor_type: ArmorType = ArmorType.無
    ) {
        super();
        this.identifier += '::Armor::' + this.detail.identifier;
        this.texture = this.detail.texture;
        this.can_transfer = this.detail.can_transfer;
        this.defense_modifier = this.detail.defense_modifier;
    }

    get detail() {
        return Armors.get(this.armor_type) ?? Armors.get(ArmorType.無)!
    }

    use(ctx: Context) {
        super.use(ctx)

        ctx.player.current_armor.unequip(ctx)
        if (ctx.player.removeObjectFromInventory(this)) {
            if (this.can_transfer) {
                ctx.player.addObjectToInventory(this)
            }

            ctx.player.current_armor = this
            this.equip(ctx)
        }
    }

    equip(ctx: Context) {
        if (this.detail.equip) {
            this.detail.equip(ctx.player)
        }
    }

    unequip(ctx: Context) {
        if (this.detail.unequip) {
            this.detail.unequip(ctx.player)
        }
    }
}
