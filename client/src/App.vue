<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import {
	ClientMessage,
	GameObject,
	ScoreItem,
	RoundData,
	RoundStatus,
	InitRoundData,
	ChatMessageData,
} from '@/types'

import Inventory from './components/Inventory.vue'
import Scoreboard from './components/Scoreboard.vue'
import Chatroom from './components/Chatroom.vue'

const init = ref(false)
const debug = ref(false)
const me = ref('')
const inventory = reactive({
	show: false,
	items: [] as GameObject[],
})
const scores = ref([] as ScoreItem[])
const round = ref<RoundData>(InitRoundData)
const chatMessages = ref([] as ChatMessageData[])
const players = ref([] as string[])

const events = ref<ClientMessage[]>([])

function handleEvent(event: any) {
	if (event instanceof CustomEvent && event.detail) {
		const message = event.detail as ClientMessage
		// console.log('event', message)
		if (!['init', 'tick', 'move'].includes(message.type))
			events.value = [message, ...events.value.slice(0, 30)]

		switch (message.type) {
			case 'init':
				init.value = true
				me.value = message.data.player.identifier
				round.value = message.data.round

			case 'interact_map':
			case 'use':
				if (message.data.player.identifier === me.value)
					inventory.items = [
						...message.data.player.inventory,
					].reverse()
				break

			case 'tick':
				scores.value = message.data.scores
				players.value = message.data.scores.map(
					score => score.identifier,
				)
				break

			case 'round':
				round.value = message.data
				break

			case 'chat':
				chatMessages.value = [...chatMessages.value, message.data]
				break
		}
	}
	if (event instanceof KeyboardEvent && !event.repeat && init.value) {
		switch (event.key.toLowerCase()) {
			case 'i':
				inventory.show = !inventory.show
				break
			case 'd':
				debug.value = !debug.value
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
		<div class="debug" v-if="debug">
			<template v-for="(event, idx) in events" :key="idx">
				<div>{{ event.type }}</div>
				<pre>{{ event.data }}</pre>
			</template>
		</div>
		<Inventory :show="inventory.show" :items="inventory.items" />
		<Scoreboard :scores="scores" :round="round" />
		<Chatroom :players="players" :messages="chatMessages" />
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

.debug {
	position: relative;
	top: 0;
	left: 0;
	width: 600px;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.5);
	color: black;
	overflow-y: scroll;
}
</style>
