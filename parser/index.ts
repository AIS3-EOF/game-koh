import { webcrypto } from 'crypto'
import { WebSocket as NodeWebSocket } from 'ws'

let crypto: any
if (typeof window === 'undefined') {
    crypto = require('crypto').webcrypto
}
else {
    crypto = window.crypto
}


// https://gist.github.com/72lions/4528834
function concatArrayBuffer(buffer1: ArrayBuffer, buffer2: ArrayBuffer) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class Parser {
    ecAlgo: webcrypto.EcKeyAlgorithm
    sharedKey?: webcrypto.CryptoKey

    constructor() {
        this.ecAlgo = { name: 'ECDH', namedCurve: 'P-256' }
    }

    async initServer(ws: NodeWebSocket) {
        const key = await crypto.subtle.generateKey(this.ecAlgo, true, ['deriveKey'])
        const pubRaw = await crypto.subtle.exportKey('raw', key.publicKey)

        // synchronize
        await new Promise(resolve => ws.once('message', resolve))
        ws.send('done')

        let res: any
        const p = new Promise(resolve => (res = resolve))
        ws.once('message', async (data: Buffer) => {
            // console.log('recv', data)
            const bobPub = await crypto.subtle.importKey('raw', data, this.ecAlgo, true, [])
            this.sharedKey = await crypto.subtle.deriveKey({
                name: "ECDH",
                public: bobPub
            }, key.privateKey,
                {
                    name: "AES-GCM",
                    length: 256
                },
                true,
                ["encrypt", "decrypt"]
            )
            // crypto.subtle.exportKey('raw', this.sharedKey).then(ex => {
            //     console.log('sharedKey', new Uint8Array(ex))
            // })
            res()
        })

        // console.log('sent', pubRaw)
        ws.send(pubRaw)
        return p
    }

    async initClient(ws: WebSocket) {
        const key = await crypto.subtle.generateKey(this.ecAlgo, true, ['deriveKey'])
        const pubRaw = await crypto.subtle.exportKey('raw', key.publicKey)

        // synchronize
        ws.send('done')
        await new Promise(resolve => {
            ws.onmessage = ()=>{
                resolve(0)
                ws.onmessage = null
            }
        })

        let res: any
        const p = new Promise(resolve => (res = resolve))
        ws.onmessage = async (e) => {
            // console.log('recv', new Uint8Array(e.data))
            const bobPub = await crypto.subtle.importKey('raw', e.data, this.ecAlgo, true, [])
            this.sharedKey = await crypto.subtle.deriveKey({
                name: "ECDH",
                public: bobPub
            }, key.privateKey,
                {
                    name: "AES-GCM",
                    length: 256
                },
                true,
                ["encrypt", "decrypt"]
            )
            // crypto.subtle.exportKey('raw', this.sharedKey).then(ex => {
            //     console.log('sharedKey', new Uint8Array(ex))
            // })
            ws.onmessage = null
            res()
        }

        // console.log('sent', new Uint8Array(pubRaw))
        ws.send(pubRaw)
        return p
    }

    async parse(cipher_text: ArrayBuffer): Promise<any> {
        // console.log('parse', new Uint8Array(cipher_text))
        const iv = new Uint8Array(cipher_text, 0, 12)
        const ct = new Uint8Array(cipher_text, 12)
        // console.log('iv', iv)
        // console.log('ct', ct)
        const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, this.sharedKey!, ct)
        return JSON.parse(new TextDecoder().decode(pt))
    }


    async stringify(obj: any): Promise<ArrayBuffer> {
        // console.log('stringify', obj)
        const pt = new TextEncoder().encode(JSON.stringify(obj))
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.sharedKey!, pt)
        // console.log('iv', iv)
        // console.log('ct', ct)
        return concatArrayBuffer(iv.buffer, ct)
    }
}
