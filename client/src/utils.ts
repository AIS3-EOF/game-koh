import { GameObject } from '@/types'

export function parseIdentifier(identifier: string) {
	const list = identifier.split('::')
	const clas = list.at(1)
	const type = list.at(2)
	const name = list.at(3)
	return { clas, type, name }
}

export function type2emoji(type: string) {
	switch (type) {
		case 'Weapon':
			return '🗡️'
		case 'Armor':
			return '🛡️'
		default:
			return '❓'
	}
}

export function object2name(object: GameObject) {
	const { clas, type, name } = parseIdentifier(object.identifier)
	// console.log(object, clas, type, name)
	return `${type2emoji(type!)} ${name}`
}
