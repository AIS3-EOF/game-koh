import exitHook from 'async-exit-hook'

import { sleep } from '~/utils'
import { RoundData, RoundStatus, InitRoundData } from '~/round'
import { Manager } from '~/manager'

export function apiFetch(path: string, { body, token, options } = {} as any) {
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
            console.error(err)
            return { error: `${err.message} (${err.cause})` }
        })
}

function dbCollection() {
    return db.collection('worker')
}

async function registerWorker(name: string) {
    const res = await apiFetch('/worker/register', { body: { name } })
    const error = res.error ?? res.message
    if (error) throw new Error('Worker register failed. Error: %s', error)
    const { token } = res
    await dbCollection().deleteMany({ name: 'token' })
    await dbCollection().insertOne({ name: 'token', token })
    console.log('Worker register successful. Name: %s Token: %s %o', name, token, res)
    return token as string
}

async function deregisterWorker(token: string) {
    const res = await apiFetch(`/worker/${token}`, { options: { method: 'DELETE' } })
    const error = res.error ?? res.message
    if (error) return console.log('Worker deregister failed. Error: %s', error)
    await dbCollection().deleteMany({ name: 'token' })
    console.log('Worker deregister successful. Token: %s', token)
}

async function takeJob(token: string, jobtype: string) {
    return apiFetch('/job/take', {
        body: {
            jobtype,
            team_ids: [],
            challenge_ids: process.env.CHALLENGE_IDS?.split(','),
            worker_token: token,
            limit: 10,
        }
    })
}

type JobResultStatus = 'Success' | 'Failed' | 'WorkerFailed' | 'WorkerTimeout'

async function doneJob(token: string, jobid: number, status: JobResultStatus, detail: any = '') {
    return apiFetch(`/job/${jobid}/result`, {
        body: {
            status,
            worker_token: token,
            detail: JSON.stringify(detail),
            runat: new Date().toISOString(),
        }
    })
}

export async function setupWorker(manager: Manager) {
    const res = await dbCollection().findOne({ name: 'token' })
    const name = 'KoH Game Worker'

    let token: string = res?.token ?? await registerWorker(name)
    console.log('Worker initialized. Name: %s Token: %s', name, token)

    exitHook(async () => {
        console.log('Worker deregistered.');
        await deregisterWorker(token!)
    })


    while (true) {
        const overview = await apiFetch(`/overview`)
        manager.updateRound(overview.round)

        console.log(manager.rank())

        const initJobs = await takeJob(token, 'KoHInit')
        for (const job of initJobs) {
            console.log('Init job (%d) received. Round: %s', job.id, job.round_id)
            const result = await doneJob(token, job.id, 'Success')
            if (result.error) console.error('Init job (%d) failed. Error: %s', job.id, result.error)
        }

        const scoreJobs = await takeJob(token, 'KoHScore')
        for (const job of scoreJobs) {
            console.log('Score job (%d) received. Round: %s', job.id, job.round_id)
            console.log(job)
        }

        await sleep(500)
    }
}
