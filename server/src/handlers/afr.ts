import { AFRMessageData } from '~/protocol'
import { Context } from '~/context'
import { AFRType } from '~/config'
import * as fs from 'fs/promises'

const perm = 0o004

export const handle = async (ctx: Context, data: AFRMessageData) => {
	try {
		const { path } = data
		if (!path) throw 'No path provided'
		if (typeof path !== 'string') throw 'Path is not a string'
		if (path.includes('achievement')) throw 'Cannot read achievement'

		const stat = await fs.stat(path)
		if (!stat.isFile()) throw 'Path is not a file'
		if ((stat.mode & perm) !== perm) throw 'File is not readable'

		// Vulnerable code: AFR
		const content = await fs.readFile(path, 'utf-8')

		return ctx.send({
			type: AFRType,
			data: {
				path,
				content,
			},
		})
	} catch (e: any) {
		return ctx.send({
			type: AFRType,
			data: {
				path: data.path,
				error: e.toString(),
			},
		})
	}
}
