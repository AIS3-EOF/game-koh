import { Vec2 } from './protocol/shared'

export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]]
export const dot = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1]

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
