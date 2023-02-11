<script setup lang="ts">
import { PlayerPub } from '@/types'
import { object2name } from '@/utils'

interface Props {
	currentPlayer: PlayerPub
}

const props = defineProps<Props>()
</script>

<template>
	<div class="profile" v-if="props.currentPlayer">
		<div class="name">{{ props.currentPlayer.name }}</div>
		<div class="health">
			<span class="label">Health</span>

			<!-- bar -->
			<div class="bar">
				<div
					class="bar-fill"
					:style="{
						width: `${
							(props.currentPlayer.hp /
								props.currentPlayer.max_hp) *
							100
						}%`,
					}"
				></div>
				<span class="value"
					>{{ props.currentPlayer.hp }} /
					{{ props.currentPlayer.max_hp }}</span
				>
			</div>
		</div>
		<!-- attack / defense / current_weapon and armor -->
		<div class="stats">
			<div class="stat">
				<span class="label">Attack</span>
				<span class="value">{{ props.currentPlayer.atk }}</span>
			</div>
			<div class="stat">
				<span class="label">Defense</span>
				<span class="value">{{ props.currentPlayer.def }}</span>
			</div>
			<div class="stat">
				<span class="label">Weapon</span>
				<span class="value">
					{{ object2name(props.currentPlayer.current_weapon) }}
				</span>
			</div>
			<div class="stat">
				<span class="label">Armor</span>
				<span class="value">
					{{ object2name(props.currentPlayer.current_armor) }}
				</span>
			</div>
			<span class="value achievements">
				<template
					v-for="achievement in props.currentPlayer.achievements"
				>
					<img
						class="achievement"
						:src="`assets/images/${achievement.type}.png`"
					/>
				</template>
			</span>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.profile {
	position: absolute;
	top: 0;
	left: 0;
	width: 200px;
	height: auto;
	background-color: rgba(0, 0, 0, 0.5);

	padding: 1rem;
	margin: 1rem;

	.name {
		font-size: 2rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}
}

.stats {
	display: flex;
	flex-direction: column;

	.stat {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.label {
		font-weight: bold;
	}
}

.achievements {
	padding-top: 8px;
	.achievement {
		max-width: calc(100%);
	}
}

.bar {
	position: relative;
	width: 100%;
	height: 20px;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 10px;

	.value {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.bar-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background-color: #ff0000;
		border-radius: 10px;
	}
}
</style>
