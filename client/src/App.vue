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
const nameMap = ref(new Map<Identifier, string>())
const playersMap = ref(new Map<Identifier, PlayerPub>())
const deathPlayerMap = ref(new Map<Identifier, DeathData>())
const currentPlayer = computed(
	() => playersMap.value.get(me.value) ?? playersMap.value.get(npc.value)!,
)

const achievement = ref('')
const showAchievement = ref(0)

function addPlayer(player: PlayerPub) {
	nameMap.value.set(player.identifier, player.name)
	playersMap.value.set(player.identifier, player)
}
function removePlayer(identifier: Identifier) {
	nameMap.value.delete(identifier)
	playersMap.value.delete(identifier)
}

function handleEvent(event: any) {
	if (event instanceof CustomEvent && event.detail) {
		const { type, data } = event.detail as ClientMessage
		if (import.meta.env.DEV) console.log('event', type, data)
		switch (type) {
			case 'init':
				init.value = true
				me.value = npc.value = data.player.identifier
				round.value = data.round
				data.players.forEach(addPlayer)
				break

			case 'join':
				addPlayer(data.player)
				break

			case 'leave':
				removePlayer(data.identifier)
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
				if (data.status === RoundStatus.END) {
					setTimeout(() => {
						location.reload()
					}, 1000)
				}
				break

			case 'chat':
				chatMessages.value.push(data)
				if (chatMessages.value.length > 100) chatMessages.value.shift()
				break

			case 'respawn':
				deathPlayerMap.value.delete(data.player.identifier)
				break

			case 'death':
				deathPlayerMap.value.set(data.victim_identifier, data)
				break

			case 'achievement': {
				achievement.value = data.achievement.type
				showAchievement.value = 10
				break
			}
		}
		if (
			type === 'damage' ||
			type === 'respawn' ||
			type === 'interact_map' ||
			type === 'use' ||
			type === 'achievement'
		) {
			const playerObj = playersMap.value.get(data.player.identifier)
			if (!playerObj) return
			Object.assign(playerObj, data.player)
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
		<div class="achievement" v-if="showAchievement">
			<img :src="`assets/images/${achievement}.png`" />
		</div>
		<Profile :currentPlayer="currentPlayer" />
		<Scoreboard :scores="scores" :round="round" />
		<Deathview :nameMap="nameMap" :deathPlayerMap="deathPlayerMap" />
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
