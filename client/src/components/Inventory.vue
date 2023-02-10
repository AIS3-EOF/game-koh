<script setup lang="ts">
import { GameObject, SendFunction } from '@/types'
import { object2name } from '@/utils'

interface Props {
	show: boolean
	items: GameObject[]
	send: SendFunction
}

const props = defineProps<Props>()

function use(item: GameObject) {
	props.send({
		type: 'use',
		data: {
			uuid: item.uuid,
		},
	})
}
</script>

<template>
	<div class="inventory" v-if="props.show">
		<h2 class="inventory-header">Inventory</h2>
		<div class="inventory-items">
			<template v-for="item in props.items" :key="item.uuid">
				<div class="inventory-item" @click="use(item)">
					{{ object2name(item) }}
				</div>
				<p class="inventory-item-description" v-if="item.description">
					[{{ item.identifier.split('::').at(-2) }}]
					{{ item.description }}
				</p>
			</template>
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
		height: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 8px;
		overflow-y: scroll;

		.inventory-item {
			width: 100%;
			height: 60px;
			background: #515151;
			border: 1px solid white;
			border-radius: 10px;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			color: white;
			cursor: pointer;

			&:hover {
				background: #3f3f3f;

				+ .inventory-item-description {
					display: block;
				}
			}

			+ .inventory-item-description {
				cursor: default;
				display: none;
				position: absolute;
				transform: translate(-30px, calc(min(475px, 100vh - 100px)));
				width: 100%;
				height: 100px;
				background: rgba($color: #3f3f3f, $alpha: 0.5);
				border: 1px solid white;
				border-radius: 10px;
				padding: 10px;
				color: white;
				white-space: pre-wrap;
			}
		}
	}
}
</style>
