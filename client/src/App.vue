<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive, computed } from 'vue'
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
const me = ref(InitIdentifier)
const npc = ref(InitIdentifier)
const showInventory = ref(false)
const scores = ref([] as ScoreItem[])
const round = ref<RoundData>(InitRoundData)
const chatMessages = ref([] as ChatMessageData[])
const playerMap = ref(new Map<Identifier, string>())
const deathPlayerMap = ref(new Map<Identifier, DeathData>())

const playersMap = ref(new Map<Identifier, PlayerPub>())
const currentPlayer = computed(
	() => playersMap.value.get(me.value) ?? playersMap.value.get(npc.value)!,
)

var achievement = ref(false)

function handleEvent(event: any) {
	if (event instanceof CustomEvent && event.detail) {
		const message = event.detail as ClientMessage
		if (import.meta.env.DEV) console.log('event', message)
		switch (message.type) {
			case 'init':
				init.value = true
				me.value = npc.value = message.data.player.identifier
				round.value = message.data.round
				message.data.players.forEach(player => {
					playerMap.value.set(player.identifier, player.name)
					playersMap.value.set(player.identifier, player)
				})
				break

			case 'interact_map':
			case 'use': {
				const playerObj = playersMap.value.get(
					message.data.player.identifier,
				)
				if (!playerObj) return
				Object.assign(playerObj, message.data.player)
				break
			}

			case 'damage': {
				const playerObj = playersMap.value.get(
					message.data.player.identifier,
				)
				if (!playerObj) return
				playerObj.hp -= message.data.damage
				break
			}

			case 'join':
				playerMap.value.set(
					message.data.player.identifier,
					message.data.player.name,
				)
				playersMap.value.set(
					message.data.player.identifier,
					message.data.player,
				)
				break

			case 'leave':
				playerMap.value.delete(message.data.identifier)
				playersMap.value.delete(message.data.identifier)
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

				if (message.data.status === RoundStatus.END) {
					setTimeout(() => {
						location.reload()
					}, 1000)
				}
				break

			case 'chat':
				chatMessages.value.push(message.data)
				break

			case 'respawn': {
				const playerObj = playersMap.value.get(
					message.data.player.identifier,
				)
				if (!playerObj) return
				Object.assign(playerObj, message.data.player)
				deathPlayerMap.value.delete(message.data.player.identifier)
				break
			}

			case 'death':
				deathPlayerMap.value.set(
					message.data.victim_identifier,
					message.data,
				)
				break

			case 'achievement':
				console.log('achievement', message)
				achievement = message.data.achievement.type
				setTimeout(() => (achievement = ''), 10000)
				break
		}
	}
	if (event instanceof KeyboardEvent && !event.repeat && init.value) {
		switch (event.key.toLowerCase()) {
			case 'i':
				showInventory.value = !showInventory.value
				break
			// esc
			case 'escape':
				showInventory.value = false
				break
		}
	}
}

function switch_camera(event: any) {
	if (event instanceof CustomEvent && event.detail) {
		const { identifier } = event.detail
		me.value = identifier
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
	props.dom.addEventListener('switch_camera', switch_camera)
})
onBeforeUnmount(() => {
	props.dom.removeEventListener('event', handleEvent)
	document.removeEventListener('keydown', handleEvent)
	props.dom.removeEventListener('switch_camera', switch_camera)
})
</script>

<template>
	<div class="container" v-if="init">
		<div class="achievement" v-if="achievement">
			<img :src="`assets/images/${achievement}.png`" />
		</div>
		<Profile :currentPlayer="currentPlayer" />
		<Scoreboard :scores="scores" :round="round" :playerMap="playerMap" />
		<Deathview :playerMap="playerMap" :deathPlayerMap="deathPlayerMap" />
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

.achievement {
	position: absolute;
	width: 100vw;
	display: flex;
	justify-content: center;
}
</style>
