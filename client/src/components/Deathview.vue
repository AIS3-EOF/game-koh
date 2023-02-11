<script setup lang="ts">
import { computed } from 'vue'
import { Identifier, DeathData } from '@/types'

interface Props {
	nameMap: Map<Identifier, string>
	deathPlayerMap: Map<Identifier, DeathData>
}

const props = defineProps<Props>()

function name(id: Identifier) {
	return props.nameMap.get(id) ?? '??'
}

const deaths = computed(() => Array.from(props.deathPlayerMap.values()))
</script>

<template>
	<div class="deathview">
		<template v-for="death in deaths" :key="death.victim_identifier">
			<div class="attacker">{{ name(death.attacker_identifier) }}</div>
			<div class="text">🔪</div>
			<div class="victim">{{ name(death.victim_identifier) }}</div>
			<div class="time">({{ death.respawn_time }}s)</div>
		</template>
	</div>
</template>

<style lang="scss" scoped>
.deathview {
	background: var(--background);
	position: absolute;
	bottom: 40px;
	right: 16px;
	width: 300px;
	height: auto;
	display: grid;
	grid-template-columns: 1fr 32px 1fr max-content;
	grid-auto-rows: 32px;
	justify-items: center;
	align-items: center;
}

.attacker,
.victim {
	max-width: 100%;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}
</style>
