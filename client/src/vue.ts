import { createApp } from 'vue'
import App from './App.vue'

export function setupVue(dom: EventTarget) {
	const app = createApp(App, { dom })
	app.mount('#app')
}
