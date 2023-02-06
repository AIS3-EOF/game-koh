import { WebSocketServer, WebSocket } from 'ws'
import { debug } from 'debug'
import { randomUUID } from 'crypto'
import * as poisson from 'poisson-process'

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

export class Manager {
    private wss: WebSocketServer
    private game: Game
    private contexts: Map<string, Context>
    private eventQueue: EventQueue

    constructor() {
        this.wss = new WebSocketServer({ port: 8080 })
        this.game = new Game(new GameMap(config.MAP_SIZE, config.MAP_SIZE))
        this.contexts = new Map<string, Context>()
        this.eventQueue = new EventQueue()

        this.eventQueue.on('event', event => {
            for (const ctx of this.contexts.values()) {
                ctx.send(event)
            }
        })

        connect().then(db => {
            log('connected to database')
            this.wss.on('connection', async ws => {
                try {
                    const sessionId = randomUUID()
                    log('%s connected', sessionId)
                    const player = await handleLogin(ws, db)
                    this.eventQueue.push({
                        type: 'join',
                        data: {player},
                    })
                    this.game.addPlayer(player)
                    log('%s logined', sessionId)
                    const ctx = new Context(sessionId, ws, this.game, player, this.eventQueue, db)
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
                            dispatch(ctx, msg)
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
            })
        })

        setInterval(() => {
            this.game.players.forEach(player => {
                player.action_count = Math.min(
                    player.action_count + config.TICK_ACTION_COUNT,
                    config.TICK_ACTION_MAX_COUNT
                )
                if (player.alive && player.login_count > 0) {
                    player.score += config.TICK_LIVE_SCORE
                }
            })
            this.eventQueue.push({
                type: 'tick',
                data: {
                    scores: Array.from(this.game.players.values()).map(player => ({
                        identifier: player.identifier,
                        score: player.score,
                    })).sort((a, b) => b.score - a.score),
                },
            })
        }, config.TICK_INTERVAL)
        
        poisson.create(config.GEN_DURATION, () => {
            const object = generateObject()
            this.game.addObject(object)
            this.eventQueue.push({
                type: 'new_object_spawned',
                data: { object },
            })
        }).start()
    }
}