import { setupWS } from '@/ws'
import { setupVue } from '@/vue'

console.log(import.meta.env)
setupWS(`ws://localhost:${import.meta.env.VITE_WS_PORT || 8080}`)
setupVue()
