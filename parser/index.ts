function parse(binary: string): any {
    return JSON.parse(binary)
}

function stringify(json: any): string {
    return JSON.stringify(json)
}

export default {
    parse,
    stringify
}