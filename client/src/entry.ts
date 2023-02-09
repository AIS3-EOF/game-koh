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
			if (e.data === 'ready' && token) {
				gameFrame.contentWindow?.postMessage({
					type: 'login',
					data: { token },
				})
				window.removeEventListener('message', listener)
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
			if (data.status === 'running') {
				hide(roundEl)
				return
			}
			show(roundEl)
			if (data.status === 'init') {
				roundText.innerText = `Round ${data.number} is initializing...`
				gameFrame.src = '/game.html' // reload
			} else if (data.status === 'end') {
				roundText.innerText = `Round ${data.number} is over!`
			}
		}
	},
	false,
)
