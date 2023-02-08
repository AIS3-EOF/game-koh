<script setup lang="ts">
import { computed } from 'vue'
import { ScoreItem, RoundData, RoundStatus } from '@/types'

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
			return `Round ${props.round.number} initializing...`
		case RoundStatus.RUNNING:
			return `Round ${props.round.number} running!`
		case RoundStatus.END:
			return `Round ${props.round.number} ended.`
		default:
			return 'Unknown round status'
	}
})
</script>

<template>
	<div class="scoreboard">
		<h2 class="header">Scoreboard</h2>
		<h3 class="text">{{ roundMessage }}</h3>
		<div class="list">
			<TransitionGroup name="scoreboard">
				<template
					v-for="(score, index) in scores"
					:key="score.identifier"
				>
					<span class="rank">{{ index + 1 }}</span>
					<span class="name">{{ score.identifier }}</span>
					<span class="score">{{ score.score }}</span>
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
	background-color: rgba(200, 200, 200, 0.7);
	color: white;
	padding: 8px;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	> .header {
		margin: 1rem;
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
