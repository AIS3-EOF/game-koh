import { WebSocketServer, WebSocket } from 'ws'
import { Db } from 'mongodb'
import { debug } from 'debug'
import { randomUUID } from 'crypto'
import * as poisson from 'poisson-process'
import { throttle } from 'underscore'

import { dispatch } from '~/handlers'
import { Context } from '~/context'
import { ServerMessage } from '~/protocol'
import { Game, GameMap, Player } from '~/game'
import { EventQueue } from '~/event_queue'
import { generateObject } from '~/game_objects'
import { connect } from '~/db'
import { handleLogin } from '~/handle_login'
import * as config from '~/config'
import parser from '~/parser'

const log = debug('server:manager')

export type ManagerEvent = 'round_init' | 'round_start' | 'round_end' | 'round_tick' | 'check_death'
export enum RoundStatus {
    PREINIT,
    INIT,
    START,
    END,
}

export class Manager {
    private wss: WebSocketServer
    private contexts: Map<string, Context>
    private game: Game
    private generator: poisson.PoissonInstance
    private db: Db | null = null
    private roundStatus: RoundStatus = RoundStatus.PREINIT
    private roundMessage = {
        [RoundStatus.PREINIT]: 'Round not initialized',
        [RoundStatus.INIT]: 'Round not started',
        [RoundStatus.START]: 'Round started',
        [RoundStatus.END]: 'Round ended',
    }
    
    constructor(
        private eventQueue: EventQueue = new EventQueue()
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

        connect().then(db => {
            log('connected to database')
            this.db = db
            this.wss.on('connection', this.handleConnection.bind(this))
        })

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
                this.roundInit()
                break
            case 'round_start':
                this.roundStart()
                break
            case 'round_end':
                this.roundEnd()
                break
            case 'round_tick':
                this.roundTick()
                break
            case 'check_death':
                throttle(this.checkDeath.bind(this), 1)
                break
        }
    }

    async handleConnection(ws: WebSocket) {
        try {
            if (this.db === null) {
                ws.send('database not connected')
                throw new Error('database not connected')
            }

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
            ctx.send({
                type: 'init',
                data: {
                    player,
                    players: Array.from(this.game.players.values()),
                    objects: Array.from(this.game.objects.values()),
                    map: this.game.map,
                },
            })
            this.contexts.set(sessionId, ctx)
            ws.on('message', rawData => {
                try {
                    const msg: ServerMessage = parser.parse(rawData.toString())
                    log('%s received %o', sessionId, msg)
                    if (this.roundStatus === RoundStatus.START) {
                        dispatch(ctx, msg)
                    } else {
                        ctx.send({
                            type: 'error',
                            data: this.roundMessage[this.roundStatus],
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


    checkDeath() {
        this.game.players.forEach((current_player: Player) => {
            if (current_player.alive && current_player.hp <= 0) {
                // sentence death
                current_player.death()
                const despawn_time = 30000// TODO: random here OuO?
                this.eventQueue.push({
                    type: 'death',
                    data: {
                        player_identifier: current_player.identifier,
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

    async roundInit() {
        if (this.roundStatus === RoundStatus.INIT) return
        this.roundStatus = RoundStatus.INIT
    }

    async roundStart() {
        if (this.roundStatus === RoundStatus.START) return
        this.roundStatus = RoundStatus.START

        this.tickInterval = setInterval(() => {
            this.eventQueue.manage('round_tick')
        }, config.TICK_INTERVAL)
        
        this.generator.start()
    }

    async roundTick() {
        if (this.roundStatus !== RoundStatus.START) return

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

    async roundEnd() {
        if (this.roundStatus === RoundStatus.END) return
        this.roundStatus = RoundStatus.END

        clearInterval(this.tickInterval)
        this.tickInterval = undefined
        this.generator.stop()
    }
}