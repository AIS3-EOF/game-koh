import { setupWS } from '@/ws'
import { setupVue } from '@/vue'

setupWS(`ws://${location.host}/ws`)
setupVue()
