import { setupWS } from '@/ws'
import { setupVue } from '@/vue'

const dom = document.createDocumentFragment()

setupWS(location.origin.replace('http', 'ws') + '/ws', dom)
setupVue(dom)
