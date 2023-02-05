import { generateArmor } from './equipments/armor'
import { generateWeapon } from './equipments/weapon'
import { GameObject } from './game_object'

const gens = [
    generateArmor,
    generateWeapon,
]

export function generateObject(): GameObject {
    const gen = gens[Math.floor(Math.random() * gens.length)]
    return gen()
}