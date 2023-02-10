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
	PlayerPub,
} from '@/types'

import Inventory from './components/Inventory.vue'
import Scoreboard from './components/Scoreboard.vue'
import Chatroom from './components/Chatroom.vue'
import Profile from './components/Profile.vue'
import Deathview from './components/Deathview.vue'

interface Props {
	dom: EventTarget
}
const props = defineProps<Props>()

const init = ref(false)
const debug = ref(false)
const me = ref(InitIdentifier)
const showInventory = ref(false)
const scores = ref([] as ScoreItem[])
const round = ref<RoundData>(InitRoundData)
const chatMessages = ref([] as ChatMessageData[])
const playerMap = ref(new Map<Identifier, string>())
const deathPlayerMap = ref(new Map<Identifier, DeathData>())
const currentPlayer = ref<PlayerPub>({} as PlayerPub)

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
				currentPlayer.value = message.data.player
				break

			case 'interact_map':
			case 'use':
				if (message.data.player.identifier === me.value) {
					currentPlayer.value.inventory =
						message.data.player.inventory
					currentPlayer.value = message.data.player
				}
				break

			case 'damage':
				if (message.data.identifier === me.value) {
					currentPlayer.value.hp -= message.data.damage
				}
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
				if (message.data.player.identifier === me.value) {
					currentPlayer.value = message.data.player
				}
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
				showInventory.value = !showInventory.value
				break
			case 'd':
				if (import.meta.env.DEV) debug.value = !debug.value
				break
			// esc
			case 'escape':
				showInventory.value = false
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
		<Profile :currentPlayer="currentPlayer" />
		<Scoreboard :scores="scores" :round="round" :playerMap="playerMap" />
		<Chatroom
			:playerMap="playerMap"
			:messages="chatMessages"
			:send="send"
		/>
		<Inventory
			:show="showInventory"
			:items="currentPlayer.inventory"
			:send="send"
		/>
	</div>
</template>

<style lang="scss">
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
