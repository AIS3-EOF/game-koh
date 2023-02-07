import { setupWS } from '@/ws'
import { setupVue } from '@/vue'

console.log(import.meta.env)
setupWS(`ws://${location.host}/ws`)
setupVue()
