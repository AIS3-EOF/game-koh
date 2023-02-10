import { Context } from '~/context'
import { debug } from 'debug'
import { randomUUID } from 'crypto'
import { Pos } from '~/protocol'
import { randomVec2 } from '~/utils'

const log = debug('server:GameObject:log')

export class GameObject {
	identifier: string = 'GameObject'
	uuid: string = randomUUID()
	texture: string = 'null'

	is_rare: boolean = false

	description: string = ''

	constructor() { }

	use(ctx: Context) {
		log(`${ctx.player.identifier} used ${this.identifier}`)
	}

	useEvent(ctx: Context, event: string) {
		log(
			`${ctx.player.identifier} used ${this.identifier} with event ${event}`,
		)
	}
}
