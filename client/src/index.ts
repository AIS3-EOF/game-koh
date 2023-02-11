import { setupWS } from '@/ws'
import { setupVue } from '@/vue'

const dom = document.getElementById('game')!

setupWS('wss://game.zoolab.org/ws', dom)
setupVue(dom)
