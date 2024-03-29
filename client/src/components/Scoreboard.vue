<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ScoreItem, RoundData, RoundStatus, Identifier } from '@/types'

interface Props {
	scores: ScoreItem[]
	round: RoundData
}

const props = defineProps<Props>()

const roundMessage = computed(() => {
	switch (props.round.status) {
		case RoundStatus.PREINIT:
			return 'Waiting for init...'
		case RoundStatus.INIT:
			return `Round ${props.round.id} initializing...`
		case RoundStatus.RUNNING:
			return `Round ${props.round.id} running!`
		case RoundStatus.END:
			return `Round ${props.round.id} ended.`
		default:
			return 'Unknown round status'
	}
})

const remain = ref(0)
function calc() {
	remain.value = Math.max(
		0,
		Math.floor((new Date(props.round.end!).getTime() - Date.now()) / 1000),
	)
}

watch(props.round, calc)

let interval: any = undefined
onMounted(() => {
	interval = setInterval(calc, 1000)
})
onBeforeUnmount(() => {
	clearInterval(interval)
})

const timeLeft = computed(() => {
	// console.log(props.round.status, props.round.end, remain.value)
	switch (props.round.status) {
		case RoundStatus.END:
			return 0
		case RoundStatus.RUNNING:
			return remain.value
		default:
			return '--'
	}
})
</script>

<template>
	<div class="scoreboard">
		<div class="header">
			<h2>Scoreboard</h2>
			<p class="time">{{ timeLeft }}s left</p>
		</div>
		<h3 class="text">{{ roundMessage }}</h3>
		<div class="list">
			<TransitionGroup name="scoreboard">
				<template
					v-for="(team, index) in props.scores"
					:key="team.identifier"
				>
					<span class="rank">{{ index + 1 }}</span>
					<span class="name">
						{{ team.name }}
					</span>
					<span class="score">{{ team.score }}</span>
				</template>
			</TransitionGroup>
		</div>
	</div>
</template>

<style scoped lang="scss">
.scoreboard {
	font-family: 'Roboto', sans-serif;
	position: absolute;
	right: 16px;
	top: 16px;
	width: 250px;
	height: 50%;
	background-color: var(--background);
	color: white;
	padding: 8px;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	> .header {
		margin: 0.5rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		> * {
			display: inline-block;
			margin: 0;
		}
	}

	> .text {
		margin: 0 1rem 0.5rem;
	}

	> .list {
		flex: 1;
		margin: 4px 16px;
		overflow-y: scroll;
		display: grid;
		grid-template-columns: max-content auto max-content;
		align-content: flex-start;
		grid-gap: 8px;

		// hidden scroll bar
		&::-webkit-scrollbar {
			width: 0;
			height: 0;
		}

		scrollbar-width: none;

		> .rank {
			font-weight: bold;

			&::after {
				content: '.';
			}
		}

		> .name {
			text-align: center;
			text-overflow: ellipsis;
			overflow: hidden;
		}

		> .score {
			text-align: right;
		}
	}
}

.scoreboard-move,
.scoreboard-enter-active,
.scoreboard-leave-active {
	transition: all 0.5s ease;
}

.scoreboard-enter-from,
.scoreboard-leave-to {
	opacity: 0;
	transform: translateX(30px);
}

.scoreboard-leave-active {
	position: absolute;
}
</style>
