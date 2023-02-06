<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import { ClientMessage, GameObject, ScoreItem } from '@/types'

import Inventory from './components/Inventory.vue'
import Scoreboard from './components/Scoreboard.vue'

const init = ref(false)
const me = ref('')
const inventory = reactive({
    show: false,
    items: [] as GameObject[],
})
const scores = ref([] as ScoreItem[])

function handleEvent(event: any) {
    if (event instanceof CustomEvent && event.detail) {
        const message = event.detail as ClientMessage
        console.log('event', message)
        switch (message.type) {
            case 'init':
                init.value = true
                me.value = message.data.player.identifier

            case 'interact_map':
            case 'use':
                if (message.data.player.identifier === me.value)
                    inventory.items = [...message.data.player.inventory].reverse()
                break
            
            case 'tick':
                scores.value = message.data.scores
                break
        }
    }
    if (event instanceof KeyboardEvent && !event.repeat && init.value) {
        switch (event.key) {
            case 'i':
                inventory.show = !inventory.show
                break
        }
    }
}

onMounted(() => {
    document.addEventListener('event', handleEvent)
    document.addEventListener('keydown', handleEvent)
})
onBeforeUnmount(() => {
    document.removeEventListener('event', handleEvent)
    document.removeEventListener('keydown', handleEvent)
})
</script>

<template>
    <div class="container" v-if="init">
        <Inventory :show="inventory.show" :items="inventory.items" />
        <Scoreboard :scores="scores" />
    </div>
</template>

<style>
.container {
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
}
</style>