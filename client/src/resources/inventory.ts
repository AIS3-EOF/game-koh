import { GameObject, Weapon, Armor } from '@/types'
import { parseIdentifier, type2emoji } from '@/utils'

export function drawInventory(inventory: GameObject[]) {
    const children = inventory.map(item => {
        const div = document.createElement('div')
        div.classList.add('inventory-item')
        const { type, name } = parseIdentifier(item.identifier)
        div.innerText = `${type2emoji(type)} ${name} `
        switch (type) {
            case 'Weapon':
                div.innerText += `(${(item as Weapon).attack_modifier})`
                break
            case 'Armor':
                div.innerText += `(${(item as Armor).defense_modifier})`
                break
        }
        div.addEventListener('click', () => {
            window.send({
                type: 'use',
                data: {
                    uuid: item.uuid,
                },
            })
        })
        return div
    })
    document.getElementById('inventory-items')!.replaceChildren(...children)
}

export function toggle() {
    document.getElementById('inventory')!.classList.toggle('open')
}