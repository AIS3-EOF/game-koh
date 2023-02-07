<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import { ChatMessageData, GameObject, ScoreItem, RoundData, RoundStatus } from '@/types'

interface Props {
    players: string[]
    messages: ChatMessageData[]
}

const props = defineProps<Props>()

// send message
const message = ref('')
const receiver = ref('(all)')
const sendMessage = () => {
    const data = {
        timestamp: Date.now(),
        from: window.me,
        to: receiver.value,
        message: message.value,
    }
    if (message.value.length > 0) {
        window.send({ type: 'chat', data })
        message.value = ''
        props.messages.push(data)
    }
}

// make list scrolled to bottom when new messages arrive
const list = ref<HTMLElement>()
onMounted(() => {
    list.value?.addEventListener('DOMNodeInserted', (event) => {
        const { currentTarget } = event
        if (currentTarget instanceof HTMLElement) {
            currentTarget.scroll({
                top: currentTarget.scrollHeight,
                behavior: 'smooth',
            })
        }
    })
})


</script>

<template>
    <div class="chatroom">
        <div class="list" ref="list">
            <TransitionGroup name="chatroom">
                <div class="message" v-for="message in messages" :key="message.timestamp + message.from">
                    <div class="message__user">
                        <span v-if="message.from === '(server)'">{{ message.from }}:</span>
                        <span v-else-if="message.to === '(all)'">{{ message.from }} 📢:</span>
                        <span v-else>{{ message.from }} &rarr; {{ message.to }}:</span>
                    </div>
                    <div class="message__text" v-html="message.message"></div>
                    <div class="message__timestamp">{{
                        new Date(message.timestamp || 0).toLocaleTimeString('en-US', {
                            hour12: false
                        })
                    }}</div>
                </div>
                <div class="message" v-if="messages.length === 0">
                    <div class="message__text">No messages yet</div>
                </div>
            </TransitionGroup>
        </div>
        <div class="input-group">
            <select v-model="receiver">
                <option value="(all)">All</option>
                <option v-for="player in players" :value="player" v-bind:key="player">{{ player }}</option>
            </select>
            <input type="text" v-model="message" @keyup.enter="sendMessage" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.chatroom {

    min-width: 400px;
    position: absolute;
    bottom: 0;
    left: 0;
    height: 200px;
    background-color: rgba(0, 0, 0, 0.5);
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
    }

    input {
        flex: 3;
    }
}
</style>