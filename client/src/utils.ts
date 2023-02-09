import { GameObject } from '@/types'

export function parseIdentifier(identifier: string) {
	const list = identifier.split('::')
	const type = list.at(-2)!
	const name = list.at(-1)!
	return { type, name }
}

export function type2emoji(type: string) {
	switch (type) {
		case 'Weapon':
			return '🗡️'
		case 'Armor':
			return '🛡️'
		case 'Item':
			return '📦'
		default:
			return '❓'
	}
}

export function object2name(object: GameObject) {
	const { type, name } = parseIdentifier(object.identifier)

	let name_emoji = ''
	switch (name) {
		case 'sunshine_shield':
			name_emoji = '🌞'
			break
		case 'magic_cloak':
			name_emoji = '🧙‍♂️'
			break
		case 'heroin_pants':
			name_emoji = '👖'
			break
		case 'broken_cloth':
			name_emoji = '🧵'
			break
		case 'iron_chestplate':
			name_emoji = '🦺'
			break
		case 'weed_bo':
			name_emoji = '🌿'
			break
		case 'nyancat':
			name_emoji = '🐱'
			break
		case 'chi_chi':
			name_emoji = '🐥'
			break
		case 'ice_bucket_challenge':
			name_emoji = '🧊'
			break
		case 'half_moon_sword':
			name_emoji = '🌙'
			break
		case 'dagger':
			name_emoji = '🗡️'
			break
		case 'ninja_shuriken':
			name_emoji = '🥋'
			break
		case 'loic':
			name_emoji = '🔥'
			break
		case 'world_ender':
			name_emoji = '🌎'
			break
		case 'strength_potion':
			name_emoji = '💪'
			break
		case 'recovery_potion':
			name_emoji = '🧪'
			break
		case 'dynamite':
			name_emoji = '💣'
			break
		case 'grow_potion':
			name_emoji = '🧬'
			break
	}
	name_emoji += name
	// console.log(object, clas, type, name)
	return `${type2emoji(type)} ${name_emoji}`
}
