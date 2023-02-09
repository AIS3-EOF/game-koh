import { generateArmor, generateWeapon } from './equipments'
import { generateItem } from './items'
export * from './equipments'

import { GameObject } from './game_object'
export * from './game_object'

export * from './items'

const gens = [generateArmor, generateWeapon, generateItem]

export function generateObject(): GameObject {
	const gen = gens[Math.floor(Math.random() * gens.length)]
	return gen()
}
