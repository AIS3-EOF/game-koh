let crypto
if (typeof require !== 'undefined') {
    crypto = require('crypto').webcrypto
}

import { webcrypto } from 'crypto'
import { WebSocket } from 'ws'

// https://gist.github.com/72lions/4528834
function concatArrayBuffer(buffer1: ArrayBuffer, buffer2: ArrayBuffer) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}

class Parser {
    ecAlgo: webcrypto.EcKeyAlgorithm
    sharedKey: webcrypto.CryptoKey

    constructor() {
        this.ecAlgo = { name: 'ECDH', namedCurve: 'P-256' }
    }

    async init(ws: WebSocket) {
        const key = await crypto.subtle.generateKey(this.ecAlgo, true, ['deriveKey'])
        const pubRaw = await crypto.subtle.exportKey('raw', key.publicKey)
        ws.send(pubRaw)
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey#ecdh_2
        ws.once('message', async (data: Buffer) => {
            const bobPub = await crypto.subtle.importKey('raw', data, this.ecAlgo, true, [])
            this.sharedKey = await crypto.subtle.deriveKey({
                name: "ECDH",
                public: bobPub
            }, key.privateKey,
                {
                    name: "AES-GCM",
                    length: 256
                },
                false,
                ["encrypt", "decrypt"]
            )
        })
    }

    async parse(cipher_text: ArrayBuffer): Promise<any> {
        const iv = new Uint8Array(cipher_text, 0, 12)
        const ct = new Uint8Array(cipher_text, 12)
        const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, this.sharedKey, ct)
        return JSON.parse(new TextDecoder().decode(pt))
    }


    async stringify(obj: any): Promise<ArrayBuffer> {
        const pt = new TextEncoder().encode(JSON.stringify(obj))
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.sharedKey, pt)
        return concatArrayBuffer(iv.buffer, ct)
    }
}

export default {
    Parser,
}
