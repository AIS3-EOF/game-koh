import { Vec2 } from './protocol/shared'
import { MAP_SIZE } from './config'

export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]]
export const dot = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1]
export const length = (a: Vec2): number => Math.sqrt(dot(a, a))
export const normalize = (a: Vec2): Vec2 => [a[0] / length(a), a[1] / length(a)]

export const calcDistance = (a: Vec2, b: Vec2, facing: Vec2): Vec2 => {
    const [cos, sin] = normalize(facing)
    const dx = b[0] - a[0], dy = b[1] - a[1]
    const x = dy * cos - dx * sin 
    const y = dx * cos + dy * sin
    return [Math.round(x), Math.round(y)]
}

export function randomVec2(): Vec2 {
    return [
        Math.floor(Math.random() * MAP_SIZE),
        Math.floor(Math.random() * MAP_SIZE)
    ]
}

// https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940?permalink_comment_id=4411145#gistcomment-4411145
export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
    fn: F,
    delay: number,
) => {
    let timeout: ReturnType<typeof setTimeout>
    return function (...args: Parameters<F>) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            fn(...args)
        }, delay)
    }
}
