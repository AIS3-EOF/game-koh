import { createApp, ref } from 'vue'
import App from './App.vue'
import { ClientMessage } from '@/types'

export function setupVue() {
    const events = [] as ClientMessage[]
    const app = createApp(App, { events })
    app.mount('#app')
}