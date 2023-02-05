import { GameObject } from '@/types'

export function toggle(inventory: GameObject[]) {
    const dom = document.getElementById('inventory')!
    if (dom.classList.toggle('open')) {
        console.log('open', inventory)
    }
}