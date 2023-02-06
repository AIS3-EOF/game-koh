<script setup lang="ts">
import { ScoreItem } from '@/types'

interface Props {
    scores: ScoreItem[]
}

const props = defineProps<Props>()

</script>

<template>
    <div class="scoreboard">
        <h2 class="header">Scoreboard</h2>
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
    position: absolute;
    right: 0;
    top: 0;
    width: 300px;
    height: 50%;
    background-color: #fff;
    color: black;
    padding: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    > .header {
        margin: 4px;
    }

    > .list {
        flex: 1;
        margin: 4px 16px;
        overflow-y: scroll;
        display: grid;
        grid-template-columns: max-content auto max-content;
        align-content: flex-start;
        grid-gap: 8px;

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