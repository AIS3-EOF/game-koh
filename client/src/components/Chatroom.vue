<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive, computed } from 'vue'
import {
	ChatMessageData,
	GameObject,
	ScoreItem,
	RoundData,
	RoundStatus,
	Identifier,
	ChatTarget,
	SendFunction,
	PlayerPub,
} from '@/types'

interface Props {
	nameMap: Map<Identifier, string>
	playersMap: Map<Identifier, PlayerPub>
	messages: ChatMessageData[]
	send: SendFunction
}

const props = defineProps<Props>()

const players = computed(() => Array.from(props.playersMap.values()))

// send message
const message = ref('')
const receiver = ref<ChatTarget>('(all)')
const sendMessage = () => {
	const data = {
		timestamp: Date.now(),
		from: window.me,
		to: receiver.value,
		message: message.value,
	}
	if (message.value.length > 0) {
		props.send({ type: 'chat', data })
		message.value = ''
		if (data.to !== '(all)' && data.to !== window.me) {
			props.messages.push(data)
		}
	}
}

// make list scrolled to bottom when new messages arrive
const list = ref<HTMLElement>()
onMounted(() => {
	list.value?.addEventListener('DOMNodeInserted', event => {
		const { currentTarget } = event
		if (currentTarget instanceof HTMLElement) {
			currentTarget.scroll({
				top: currentTarget.scrollHeight,
				behavior: 'smooth',
			})
		}
	})
})

// convert message.message to html (bbcode)

const bbcode = (text: string) => {
	text = String(text)
	const entities = new Map([
		['&', '&amp;'],
		['<', '&lt;'],
		['>', '&gt;'],
	])
	const escape = (str: string) =>
		str.replace(/[&<>]/g, char => entities.get(char) || char)
	const bbcode = [
		{ regex: /\[b\](.*?)\[\/b\]/g, replace: '<b>$1</b>' },
		{ regex: /\[i\](.*?)\[\/i\]/g, replace: '<i>$1</i>' },
		{ regex: /\[u\](.*?)\[\/u\]/g, replace: '<u>$1</u>' },
		{ regex: /\[s\](.*?)\[\/s\]/g, replace: '<s>$1</s>' },
		{
			regex: /\[color=(.*?)\](.*?)\[\/color\]/g,
			replace: '<span style="color: $1">$2</span>',
		},
		{ regex: /\[br\]/g, replace: '<br />' },
	]
	let html = escape(text)
	for (const { regex, replace } of bbcode) {
		html = html.replace(regex, replace)
	}
	return html
}

function name(id: Identifier) {
	return props.nameMap.get(id)
}

function displayUser(message: ChatMessageData) {
	if (message.from === '(server)' || message.from === '(all)')
		return message.from
	const from = name(message.from)
	if (message.to === '(all)') return `${from} 📢`
	if (message.to === '(server)') return `${from}`
	const to = name(message.to)
	return `${from} → ${to}`
}
</script>

<template>
	<div class="chatroom">
		<div class="list" ref="list">
			<TransitionGroup name="chatroom">
				<div
					class="message"
					v-for="message in messages"
					:key="`${message.timestamp} ${message.from}`"
				>
					<div class="message__user">
						<span>{{ displayUser(message) }}:</span>
					</div>
					<div
						v-if="message.advanced"
						class="message__text"
						v-html="bbcode(message.message)"
					></div>
					<div v-else class="message__text">
						{{ message.message }}
					</div>
					<div class="message__timestamp">
						{{
							new Date(message.timestamp || 0).toLocaleTimeString(
								'en-US',
								{
									hour12: false,
								},
							)
						}}
					</div>
				</div>
				<div class="message" v-if="messages.length === 0">
					<div class="message__text">No messages yet</div>
				</div>
			</TransitionGroup>
		</div>
		<div class="input-group">
			<select v-model="receiver">
				<option value="(all)">All</option>
				<option
					v-for="{ identifier, name } in players"
					:value="identifier"
					:key="identifier"
				>
					{{ name }}
				</option>
			</select>
			<input
				type="text"
				v-model="message"
				@keyup.enter="sendMessage"
				@keydown.stop
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.chatroom {
	width: 400px;
	position: absolute;
	bottom: 0;
	left: 0;
	height: 200px;
	background-color: var(--background);
	border: 1px solid #333;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	padding: 10px;

	.list {
		height: 100%;
		overflow-y: scroll;

		.message {
			display: flex;
			flex-direction: row;

			.message__user {
				font-weight: bold;
				margin-right: 10px;
			}

			.message__text {
				flex: 1;
			}

			.message__text::before {
				content: '"';
			}

			.message__text::after {
				content: '"';
			}
		}

		// no scrollbars
		&::-webkit-scrollbar {
			display: none;
		}

		-ms-overflow-style: none;
		/* IE and Edge */
		scrollbar-width: none;
		/* Firefox */
	}
}

.input-group {
	display: flex;
	flex-direction: row;

	select {
		flex: 1;
		max-width: 50%;
	}

	input {
		flex: 3;
	}
}
</style>
