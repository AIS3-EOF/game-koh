import { Vec2 } from '@/types'

export default class Weapon {
	public weaponType: string
	public damageRange: Vec2[]
	constructor(weaponType: string, damageRange: Vec2[]) {
		this.weaponType = weaponType
		this.damageRange = damageRange
	}
}
