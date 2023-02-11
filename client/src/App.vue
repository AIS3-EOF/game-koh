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
const me = ref(InitIdentifier)
const showInventory = ref(false)
const scores = ref([] as ScoreItem[])
const round = ref<RoundData>(InitRoundData)
const chatMessages = ref([] as ChatMessageData[])
const playerMap = ref(new Map<Identifier, string>())
const deathPlayerMap = ref(new Map<Identifier, DeathData>())
const currentPlayer = ref<PlayerPub>({} as PlayerPub)

const achievement = ref('')
const showAchievement = ref(0)

function handleEvent(event: any) {
	if (event instanceof CustomEvent && event.detail) {
		const { type, data } = event.detail as ClientMessage
		if (import.meta.env.DEV) console.log('event', type, data)
		switch (type) {
			case 'init':
				init.value = true
				me.value = data.player.identifier
				round.value = data.round
				data.players.forEach(player => {
					playerMap.value.set(player.identifier, player.name)
				})
				currentPlayer.value = data.player
				break

			case 'interact_map':
			case 'use':
				if (data.player.identifier === me.value) {
					currentPlayer.value.inventory = data.player.inventory
					currentPlayer.value = data.player
				}
				break

			case 'damage':
				if (data.player.identifier === me.value) {
					currentPlayer.value.hp -= data.damage
				}
				break

			case 'join':
				playerMap.value.set(data.player.identifier, data.player.name)
				break

			case 'leave':
				playerMap.value.delete(data.identifier)
				break

			case 'tick':
				scores.value = data.scores
				deathPlayerMap.value.forEach(death => {
					death.respawn_time -= 1
				})
				if (showAchievement.value > 0) showAchievement.value -= 1
				break

			case 'round':
				if (import.meta.env.DEV) console.log('round', data)
				round.value = data
				break

			case 'chat':
				chatMessages.value.push(data)
				break

			case 'respawn':
				if (data.player.identifier === me.value) {
					currentPlayer.value = data.player
				}
				deathPlayerMap.value.delete(data.player.identifier)
				break

			case 'death':
				deathPlayerMap.value.set(data.victim_identifier, data)
				break
			case 'achievement':
				if (data.player.identifier === me.value) {
					achievement.value = data.achievement.type
					currentPlayer.value = data.player
					showAchievement.value = 10
				}
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
		<div class="achievement" v-if="showAchievement">
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

<style lang="scss" scoped>
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
