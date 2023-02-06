import { WebSocketServer, WebSocket } from 'ws'
import { Db } from 'mongodb'
import { debug } from 'debug'
import { randomUUID } from 'crypto'
import * as poisson from 'poisson-process'
import { throttle } from 'underscore'

import { dispatch } from '~/handlers'
import { Context } from '~/context'
import { ServerMessage, RoundStatus, RoundData } from '~/protocol'
import { Game, GameMap, Player } from '~/game'
import { EventQueue } from '~/event_queue'
import { generateObject } from '~/game_objects'
import { handleLogin } from '~/handle_login'
import * as config from '~/config'
import parser from '~/parser'

const log = debug('server:manager')

export type ManagerEvent = 'round_init' | 'round_start' | 'round_end' | 'round_tick' | 'check_death'
export const roundMessage = {
    [RoundStatus.PREINIT]: 'not initialized',
    [RoundStatus.INIT]: 'not started',
    [RoundStatus.START]: 'started',
    [RoundStatus.END]: 'ended',
}

export class Manager {
    private wss: WebSocketServer
    private contexts: Map<string, Context>
    private game: Game
    private generator: poisson.PoissonInstance
    
    constructor(
        public db: Db,
        public eventQueue: EventQueue,
        private round: RoundData = {
            number: 1,
            status: RoundStatus.PREINIT,
        },
    ) {
        this.wss = new WebSocketServer({ port: 8080 })
        this.contexts = new Map<string, Context>()
        this.game = new Game(new GameMap(config.MAP_SIZE, config.MAP_SIZE), this.eventQueue)

        this.eventQueue.on('event', event => {
            for (const ctx of this.contexts.values()) {
                ctx.send(event)
            }
        })

        this.eventQueue.on('manage', this.handleEvent.bind(this))

        this.wss.on('connection', this.handleConnection.bind(this))

        this.generator = poisson.create(config.GEN_DURATION, () => {
            const object = generateObject()
            this.game.addObject(object)
            this.eventQueue.push({
                type: 'new_object_spawned',
                data: { object },
            })
        })
    }

    handleEvent(event: ManagerEvent) {
        log('handle event %s', event)
        switch (event) {
            case 'round_init':
                this.roundInitImpl()
                break
            case 'round_start':
                this.roundStartImpl()
                break
            case 'round_end':
                this.roundEndImpl()
                break
            case 'round_tick':
                this.roundTick()
                break
            case 'check_death':
                this.checkDeath()
                break
        }
    }

    async handleConnection(ws: WebSocket) {
        try {
            const sessionId = randomUUID()
            log('%s connected', sessionId)
            const player = await handleLogin(ws, this.db)
            this.eventQueue.push({
                type: 'join',
                data: { player },
            })
            this.game.addPlayer(player)
            log('%s logined', sessionId)
            const ctx = new Context(sessionId, ws, this.game, player, this.eventQueue, this.db)
            ctx.init(this.round)
            this.contexts.set(sessionId, ctx)
            ws.on('message', rawData => {
                try {
                    const msg: ServerMessage = parser.parse(rawData.toString())
                    log('%s received %o', sessionId, msg)
                    if (this.round.status === RoundStatus.START) {
                        dispatch(ctx, msg)
                    } else {
                        ctx.send({
                            type: 'error',
                            data: `Round ${this.round.number} ${roundMessage[this.round.status]}`,
                        })
                    }
                } catch (e) {
                    log('error: %s', e)
                    ws.close()
                }
            })
            ws.on('close', () => {
                log('%s disconnected', sessionId)
                this.game.removePlayer(player)
                this.contexts.delete(sessionId)
            })
        } catch (e) {
            log('error: %s', e)
            ws.close()
        }
    }

    public checkDeath = throttle(this.checkDeathImpl.bind(this), 1)
    private checkDeathImpl() {
        log('check death impl')
        this.game.players.forEach((current_player: Player) => {
            if (current_player.alive && current_player.hp <= 0) {
                // sentence death
                current_player.death()
                const despawn_time = 30000// TODO: random here OuO?
                
                this.eventQueue.push({
                    type: 'death',
                    data: {
                        victim_identifier: current_player.identifier,
                        attacker_identifier: current_player.last_damage_from,
                        despawn_time
                    }
                })
    
                // respawn player
                setTimeout(() => {
                    current_player.respawn()
                    current_player.pos = this.game.map.getRandomSpawnPosition()
                    this.eventQueue.push({
                        type: 'respawn',
                        data: {
                            player: current_player
                        }
                    })
                }, despawn_time)
            }
        })
    }

    private tickInterval: NodeJS.Timeout | undefined

    roundInit() {
        this.eventQueue.manage('round_init')
    }
    private async roundInitImpl() {
        if (this.round.status === RoundStatus.INIT) return
        this.updateStatus(RoundStatus.INIT)

        this.game.scores.clear()

        if (this.round.number % config.ROUND_PER_CYCLE == 1) {
            this.game.map = new GameMap(config.MAP_SIZE, config.MAP_SIZE)

            this.game.objects.clear()

            this.game.players.forEach(player => {
                player.respawn()
                player.pos = this.game.map.getRandomSpawnPosition()
            })

            this.contexts.forEach(ctx => {
                ctx.init(this.round)
            })
        }
    }

    roundStart() {
        this.eventQueue.manage('round_start')
    }
    private async roundStartImpl() {
        if (this.round.status === RoundStatus.START) return
        this.updateStatus(RoundStatus.START)

        this.tickInterval = setInterval(() => {
            this.eventQueue.manage('round_tick')
        }, config.TICK_INTERVAL)
        
        this.generator.start()
    }

    private async roundTick() {
        if (this.round.status !== RoundStatus.START) return

        this.game.players.forEach(player => {
            player.action_count = Math.min(
                player.action_count + config.TICK_ACTION_COUNT,
                config.TICK_ACTION_MAX_COUNT
            )
            if (player.alive && player.login_count > 0) {
                this.game.addScore(player, config.TICK_LIVE_SCORE)
            }
        })

        this.eventQueue.push({
            type: 'tick',
            data: {
                scores: this.game.getScores(),
            },
        })
    }

    roundEnd() {
        this.eventQueue.manage('round_end')
    }
    private async roundEndImpl() {
        if (this.round.status === RoundStatus.END) return
        this.updateStatus(RoundStatus.END)

        clearInterval(this.tickInterval)
        this.tickInterval = undefined
        this.generator.stop()

        this.round.number++
    }

    private updateStatus(status: RoundStatus) {
        this.round.status = status
        this.eventQueue.push({
            type: 'round',
            data: this.round
        })
    }
}