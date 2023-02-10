import { createApp } from 'vue'
import App from './App.vue'

export function setupVue(dom: DocumentFragment) {
	const app = createApp(App, { dom })
	app.mount('#app')
}
