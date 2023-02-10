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
				<div class="inventory-item">
					<p style="flex:1;text-align: center;padding-left: 64px;">{{ object2name(item) }}</p>
					<!-- use button -->
					<button @click="use(item)">Use</button>
				</div>
				<p class="inventory-item-description" v-if="item.description">
					[{{ item.identifier.split('::').at(-2) }}]
					<span v-html="item.description"></span>
				</p>
			</template>
			<template v-if="props.items.length === 0">
				(Nothing Here...)
			</template>
		</div>
	</div>
</template>

<style scoped lang="scss">
.inventory {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -60%);
	width: calc(min(500px, 100vw - 100px));
	height: calc(min(500px, 100vh - 100px));
	background: #515151;
	border-radius: 10px;
	padding: 20px;
	display: flex;
	flex-direction: column;

	>.inventory-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 4px 0 20px 0;
		color: white;
	}

	>.inventory-items {
		height: 100%;
		padding: 10px;
		overflow-y: auto;

		.inventory-item {
			width: 100%;
			height: 60px;
			margin-bottom: 16px;
			background: #515151;
			outline: 1px solid white;
			border-radius: 10px;
			display: flex;
			justify-content: center;
			align-items: center;
			color: white;

			&:hover {
				background: #3f3f3f;

				+.inventory-item-description {
					display: block;
				}
			}

			>button {
				margin-right: 10px;
				visibility: hidden;
				padding: 4px;
				border: 1px solid white;
				border-radius: 5px;
				background: #3f3f3f;
				color: white;
				width: 60px;
				font-size: 18px;
				cursor: pointer;

				&:hover {
					background: #616161;
				}

				&:active {
					background: #515151;
				}
			}


			&:hover>button {
				visibility: visible;
			}

			+.inventory-item-description {
				cursor: default;
				display: none;
				position: fixed;
				bottom: -150px;
				left: 50%;
				transform: translateX(-50%);
				font-size: 18px;
				width: 100%;
				height: 100px;
				background: rgba($color: #3f3f3f, $alpha: 0.85);
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
