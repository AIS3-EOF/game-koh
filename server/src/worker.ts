import exitHook from 'async-exit-hook'

import { sleep } from '~/utils'
import { RoundData, RoundStatus, InitRoundData } from '~/round'
import { Manager } from '~/manager'
import { ROUND_TIME_INIT, ROUND_TIME, ROUND_TIME_END } from '~/config'

import { debug } from 'debug'

const log = debug('server:worker:log')
const warn = debug('server:worker:warn')
const error = debug('server:worker:error')

export async function apiFetch(
	path: string,
	{ body, token, options } = {} as any,
) {
	if (!process.env.SCOREBOARD_URL) {
		warn('No scoreboard url provided.')
		switch (path) {
			case '/team/my':
				return { id: Math.ceil(Math.random() * 10000000), name: token }
		}
		return { error: 'No scoreboard url provided.' }
	}

	if (!options) options = {}
	if (!options.headers) options.headers = {}
	options.headers['Accept'] = 'application/json'
	options.headers['Authorization'] = token ?? process.env.SCOREBOARD_TOKEN
	if (body) {
		options.method = 'POST'
		options.headers['Content-Type'] = 'application/json'
		options.body = JSON.stringify(body)
	}
	// @ts-ignore
	return fetch(process.env.SCOREBOARD_URL + path, options)
		.then((res: any) => {
			if (res.headers.get('content-type') === 'application/json')
				return res.json()
			return { error: 'Invalid response' }
		})
		.catch((err: Error) => {
			error(err)
			return { error: `${err.message} (${err.cause})` }
		})
}

function dbCollection() {
	return db.collection('worker')
}

async function registerWorker(name: string) {
	const res = await apiFetch('/worker/register', { body: { name } })
	const error = res.error ?? res.message
	if (error) throw new Error('Worker register failed. Error: ' + error)
	const { token } = res
	await dbCollection().deleteMany({ name: 'token' })
	await dbCollection().insertOne({ name: 'token', token })
	log(
		'Worker register successful. Name: %s Token: %s %o',
		name,
		token,
		res,
	)
	return token as string
}

async function deregisterWorker(token: string) {
	const res = await apiFetch(`/worker/${token}`, {
		options: { method: 'DELETE' },
	})
	const error = res.error ?? res.message
	if (error) return log('Worker deregister failed. Error: %s', error)
	await dbCollection().deleteMany({ name: 'token' })
	log('Worker deregister successful. Token: %s', token)
}

async function takeJob(token: string, jobtype: string) {
	return apiFetch('/job/take', {
		body: {
			jobtype,
			team_ids: [],
			challenge_ids: process.env.CHALLENGE_IDS?.split(','),
			worker_token: token,
			limit: 10,
		},
	})
}

type JobResultStatus = 'Success' | 'Failed' | 'WorkerFailed' | 'WorkerTimeout'

async function doneJob(
	token: string,
	jobid: number,
	status: JobResultStatus,
	detail: any = '',
) {
	return apiFetch(`/job/${jobid}/result`, {
		body: {
			status,
			worker_token: token,
			detail: JSON.stringify(detail),
			runat: new Date().toISOString(),
		},
	})
}

export async function setupWorker(manager: Manager) {
	if (!process.env.SCOREBOARD_URL) {
		warn('No scoreboard url provided. Worker disabled.')
		let id = 1
		while (true) {
			const now = Date.now()
			const start = new Date(now + ROUND_TIME_INIT * 1000).toISOString()
			const end = new Date(
				now + (ROUND_TIME_INIT + ROUND_TIME) * 1000,
			).toISOString()
			manager.updateRound({ id, status: RoundStatus.INIT, start, end })
			await sleep(ROUND_TIME_INIT * 1000)
			manager.updateRound({ id, status: RoundStatus.RUNNING, start, end })
			await sleep(ROUND_TIME * 1000)
			manager.updateRound({ id, status: RoundStatus.END, start, end })
			await sleep(ROUND_TIME_END * 1000)
			id++
		}
		return
	}

	const res = await dbCollection().findOne({ name: 'token' })
	const name = process.env.WORKER_NAME ?? 'KoH Game Worker'

	let token: string = res?.token ?? (await registerWorker(name))
	log('Worker initialized. Name: %s Token: %s', name, token)

	exitHook(async () => {
		log('Worker deregistered.')
		await deregisterWorker(token!)
	})

	while (true) {
		const overview = await apiFetch(`/overview`)
		const round = {
			id: overview.round.id,
			status: overview.round.status,
			start: overview.round.start?.replace(/$/, 'Z'),
			end: overview.round.end?.replace(/$/, 'Z'),
		}
		manager.updateRound(round)

		const initJobs = await takeJob(token, 'KoHInit')
		for (const job of initJobs) {
			log(
				'Init job (%d) received. Round: %s',
				job.id,
				job.round_id,
			)
			const result = await doneJob(token, job.id, 'Success')
			if (result.error)
				error(
					'Init job (%d) failed. Error: %s',
					job.id,
					result.error,
				)
		}

		const scoreJobs = await takeJob(token, 'KoHScore')
		for (const job of scoreJobs) {
			log(
				'Score job (%d) received. Round: %s',
				job.id,
				job.round_id,
			)
			const ranks = await manager.rank(job.round_id)
			const status = ranks ? 'Success' : 'Failed'
			const result = await doneJob(token, job.id, status, ranks)
			if (result.error)
				error(
					'Score job (%d) failed. Error: %s',
					job.id,
					result.error,
				)
			log({ job, round, ranks, status, result })
		}

		await sleep(500)
	}
}
