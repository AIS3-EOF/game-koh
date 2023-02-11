import { setupWS } from '@/ws'
import { setupVue } from '@/vue'

const dom = document.getElementById('game')!

setupWS(import.meta.env.VITE_WS_SERVER, dom)
setupVue(dom)
