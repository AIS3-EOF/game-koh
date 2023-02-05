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
        default:
            return '❓'
    }
}