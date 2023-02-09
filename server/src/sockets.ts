import { WebSocket } from 'ws'

export class Sockets {
    public map = new Map<number, Set<WebSocket>>()

    public add(id: number, socket: WebSocket) {
        if (!this.map.has(id)) this.map.set(id, new Set())
        this.map.get(id)!.add(socket)
    }

    public delete(id: number, socket: WebSocket) {
        if (!this.map.has(id)) return
        this.map.get(id)?.delete(socket)
    }

    public send(id: number, message: string) {
        if (!this.map.has(id)) return
        this.map.get(id)?.forEach((socket) => socket.send(message))
    }

    public has(id: number) {
        return this.map.has(id)
    }
}

declare global {
    var sockets: Sockets
}
