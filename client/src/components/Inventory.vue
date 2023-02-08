<script setup lang="ts">
import { GameObject } from '@/types'
import { object2name } from '@/utils'

interface Props {
	show: boolean
	items: GameObject[]
}

const props = defineProps<Props>()

function use(item: GameObject) {
	window.send({
		type: 'use',
		data: {
			uuid: item.uuid,
		},
	})
}
</script>

<template>
	<div class="inventory" v-if="show">
		<h2 class="inventory-header">Inventory</h2>
		<div class="inventory-items">
			<div
				v-for="item in items"
				:key="item.uuid"
				class="inventory-item"
				@click="use(item)"
			>
				{{ object2name(item) }}
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.inventory {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: calc(min(500px, 100vw - 100px));
	height: calc(min(500px, 100vh - 100px));
	background: #515151;
	border-radius: 10px;
	padding: 20px;
	display: flex;
	flex-direction: column;

	> .inventory-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 4px 0 20px 0;
		color: white;
	}

	> .inventory-items {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		overflow-y: scroll;

		> .inventory-item {
			width: 100%;
			height: 60px;
			background: #515151;
			border: 1px solid white;
			border-radius: 10px;
			display: flex;
			justify-content: center;
			align-items: center;
			color: white;
			cursor: pointer;

			&:hover {
				background: #3f3f3f;
			}
		}
	}
}
</style>
