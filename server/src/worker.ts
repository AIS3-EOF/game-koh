export function apiFetch(path: string, options = {}, token = '') {
    if (!options.headers)
        options.headers = {}
    options.headers['Authorization'] = token || process.env.SCOREBOARD_TOKEN
    return fetch(process.env.SCOREBOARD_URL + path, options)
        .then((res) => {
            if (res.headers.get('content-type') === 'application/json')
                return res.json()
            return { error: 'Invalid response' }
        })
        .catch((err) => {
            console.error(err)
            return { error: `${err.message} (${err.cause.message})` }
        })
}
