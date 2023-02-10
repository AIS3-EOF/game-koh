<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import {
	ClientMessage,
	ServerMessage,
	GameObject,
	ScoreItem,
	RoundData,
	RoundStatus,
	InitRoundData,
	ChatMessageData,
	Identifier,
	InitIdentifier,
	DeathData,
} from '@/types'

import Inventory from './components/Inventory.vue'
import Scoreboard from './components/Scoreboard.vue'
import Chatroom from './components/Chatroom.vue'
import Deathview from './components/Deathview.vue'

interface Props {
	dom: EventTarget
}
const props = defineProps<Props>()

const init = ref(false)
const debug = ref(false)
const me = ref(InitIdentifier)
const inventory = reactive({
	show: false,
	items: [] as GameObject[],
})
const scores = ref([] as ScoreItem[])
const round = ref<RoundData>(InitRoundData)
const chatMessages = ref([] as ChatMessageData[])
const playerMap = ref(new Map<Identifier, string>())
const deathPlayerMap = ref(new Map<Identifier, DeathData>())

const events = ref<ClientMessage[]>([])

function handleEvent(event: any) {
	if (event instanceof CustomEvent && event.detail) {
		const message = event.detail as ClientMessage
		if (import.meta.env.DEV) console.log('event', message)
		const n_debug_events = ['init', 'tick', 'move', 'new_object_spawned']
		if (!n_debug_events.includes(message.type))
			events.value = [message, ...events.value.slice(0, 30)]

		switch (message.type) {
			case 'init':
				init.value = true
				me.value = message.data.player.identifier
				round.value = message.data.round
				message.data.players.forEach(player => {
					playerMap.value.set(player.identifier, player.name)
				})

			case 'interact_map':
			case 'use':
				if (message.data.player.identifier === me.value)
					inventory.items = [
						...message.data.player.inventory,
					].reverse()
				break

			case 'join':
				playerMap.value.set(
					message.data.player.identifier,
					message.data.player.name,
				)
				break

			case 'leave':
				playerMap.value.delete(message.data.identifier)
				break

			case 'tick':
				scores.value = message.data.scores
				deathPlayerMap.value.forEach(death => {
					death.respawn_time -= 1
				})
				break

			case 'round':
				if (import.meta.env.DEV) console.log('round', message.data)
				round.value = message.data
				break

			case 'chat':
				chatMessages.value.push(message.data)
				break

			case 'respawn':
				deathPlayerMap.value.delete(message.data.player.identifier)
				break

			case 'death':
				deathPlayerMap.value.set(
					message.data.victim_identifier,
					message.data,
				)
				break
		}
	}
	if (event instanceof KeyboardEvent && !event.repeat && init.value) {
		switch (event.key.toLowerCase()) {
			case 'i':
				inventory.show = !inventory.show
				break
			case 'd':
				if (import.meta.env.DEV) debug.value = !debug.value
				break
			// esc
			case 'escape':
				inventory.show = false
				break
		}
	}
}

function send(message: ServerMessage) {
	props.dom.dispatchEvent(
		new CustomEvent('send', {
			detail: message,
		}),
	)
}

onMounted(() => {
	props.dom.addEventListener('event', handleEvent)
	document.addEventListener('keydown', handleEvent)
})
onBeforeUnmount(() => {
	props.dom.removeEventListener('event', handleEvent)
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
		<Scoreboard :scores="scores" :round="round" :playerMap="playerMap" />
		<Deathview :playerMap="playerMap" :deathPlayerMap="deathPlayerMap" />
		<Chatroom
			:playerMap="playerMap"
			:messages="chatMessages"
			:send="send"
		/>
		<Inventory
			:show="inventory.show"
			:items="inventory.items"
			:send="send"
		/>
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
