import { WebSocket } from 'ws'

type BufferLike =
	| string
	| Buffer
	| DataView
	| number
	| ArrayBufferView
	| Uint8Array
	| ArrayBuffer
	| SharedArrayBuffer
	| ReadonlyArray<any>
	| ReadonlyArray<number>
	| { valueOf(): ArrayBuffer }
	| { valueOf(): SharedArrayBuffer }
	| { valueOf(): Uint8Array }
	| { valueOf(): ReadonlyArray<number> }
	| { valueOf(): string }
	| { [Symbol.toPrimitive](hint: string): string }

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

	public send(id: number, message: BufferLike) {
		if (!this.map.has(id)) return
		this.map.get(id)?.forEach(socket => socket.send(message))
	}

	public has(id: number) {
		return this.map.has(id)
	}
}

declare global {
	var sockets: Sockets
}
