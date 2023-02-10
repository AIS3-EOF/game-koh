import { Context } from '~/context'
import { Identifier, ClientMessage } from '~/protocol'

export class Sockets {
	public map = new Map<Identifier, Set<Context>>()

	public add(id: Identifier, ctx: Context) {
		if (!this.map.has(id)) this.map.set(id, new Set())
		this.map.get(id)!.add(ctx)
	}

	public delete(id: Identifier, ctx: Context) {
		if (!this.map.has(id)) return
		this.map.get(id)?.delete(ctx)
	}

	public send(id: Identifier, message: ClientMessage) {
		if (!this.map.has(id)) return
		this.map.get(id)?.forEach(ctx => ctx.send(message))
	}

	public has(id: Identifier) {
		return this.map.has(id)
	}
}

declare global {
	var sockets: Sockets
}
