import { setupWS } from '@/ws'
import { setupVue } from '@/vue'

setupWS(location.origin.replace('http', 'ws') + '/ws')
setupVue()
