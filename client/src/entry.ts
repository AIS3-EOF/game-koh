import { RoundStatus, RoundData } from '@/types'

let prevRound: RoundData | null = null
let token: string | null = null
const gameFrame = document.getElementById('gameFrame') as HTMLIFrameElement
const roundEl = document.getElementById('round') as HTMLDivElement
const roundText = document.getElementById('round-text') as HTMLDivElement

const show = (el: HTMLElement) => (el.style.display = 'block')
const hide = (el: HTMLElement) => (el.style.display = 'none')

gameFrame.addEventListener(
	'load',
	function () {
		const listener = function (e: MessageEvent) {
			if (e.data === 'ready') {
				window.removeEventListener('message', listener)
				if (!token) return
				gameFrame.contentWindow?.postMessage({
					type: 'login',
					data: { token },
				})
			}
		}
		window.addEventListener('message', listener, false)
	},
	false,
)

hide(roundEl)
window.addEventListener(
	'message',
	function (e) {
		const { type, data } = e.data
		if (type === 'login') {
			token = data.token
		} else if (type === 'round') {
			console.log('round', data)
			if (data.status === RoundStatus.RUNNING) {
				hide(roundEl)
				return
			}
			show(roundEl)
			if (data.status === RoundStatus.INIT) {
				roundText.innerText = `Round ${data.id} is initializing...`
				gameFrame.src = '/game.html' // reload
			} else if (data.status === RoundStatus.END) {
				roundText.innerText = `Round ${data.id} is over!`
			}
			prevRound = data
		} else if (type === 'init') {
			hide(roundEl)
		}
	},
	false,
)
