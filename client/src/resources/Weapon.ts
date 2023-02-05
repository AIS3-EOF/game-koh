import { Vec2 } from '@/types'

export default class Weapon{
    public weaponType: string;
    public damageRange: Vec2[];
    constructor(weaponType, damageRange){
        this.weaponType = weaponType;
        this.damageRange = damageRange;
    }
}