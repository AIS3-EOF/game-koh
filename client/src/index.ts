import { setupWS } from '@/ws'
import { setupVue } from '@/vue'

const dom = document.getElementById('game')!

setupWS(location.origin.replace('http', 'ws') + '/ws', dom)
setupVue(dom)
