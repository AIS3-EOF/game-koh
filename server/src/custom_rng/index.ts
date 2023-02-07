import * as crypto from 'crypto'

function sha256(s: ArrayBuffer) {
	return new Uint8Array(crypto.createHash('sha256').update(Buffer.from(s)).digest()).buffer
}

function arrToNum(arr: ArrayBuffer) {
	const ua = new Uint32Array(arr)
	let ret = 0n
	for (let i = 0; i < ua.length; i++) {
		ret += BigInt(ua[i]) << BigInt(i * 32)
	}
	return ret
}

function cryptoRand() {
	return arrToNum(crypto.getRandomValues(new Uint32Array(4)))
}

function magic(s: string, n: number) {
	let m = new TextEncoder().encode(s).buffer
	const ret = []
	for (let i = 0; i < n; i++) {
		m = sha256(m)
		ret.push(arrToNum(m))
	}
	return ret
}

class RNG {
	p: bigint
	coef: bigint[]
	state: bigint[]
	constructor(coef: bigint[], state: bigint[]) {
		this.p = 18446744073709551629n
		this.coef = coef.map<bigint>(x => x % this.p)
		this.state = state.map<bigint>(x => x % this.p)
	}
	next() {
		const out = this.state[0]
		const res = this.coef.map((x, i) => (x * this.state[i]) % this.p).reduce((a, b) => a + b, 0n) % this.p
		this.state = this.state.slice(1).concat([res])
		return out
	}
	static newRng(key: string, state: bigint[], n: number) {
		const coef = magic(key, n)
		return new RNG(coef, state)
	}
}

function BigIntDivision(a: bigint, b: bigint, prec: number) {
	// https://stackoverflow.com/questions/54409854/how-to-divide-two-native-javascript-bigints-and-get-a-decimal-result
	return Number((a * BigInt(prec)) / b) / prec
}

export function randProb(key: string, userProvidedSeeds: string[], n = 3, m = 24) {
	while (userProvidedSeeds.length < n) {
		userProvidedSeeds.push(String(cryptoRand()))
	}
	const rng = RNG.newRng(key, userProvidedSeeds.map(BigInt), n)
	const _ = Array.from({ length: n }).map(rng.next.bind(rng))
	const s = Array.from({ length: m })
		.map(rng.next.bind(rng))
		.reduce((a, b) => a + b, 0n)
	return BigIntDivision(s, rng.p, 10000) / m
}

// console.log(randProb('ROUND3', ['123', '456', '789']))
// console.log(randProb('ROUND3', ['10661734412383673398', '13909205108959144655', '6226358524459903252']))
// console.log(
// 	randProb('ROUND3', ['10361502652862169544', '8351152086253191333', '9713909200824470063', '9105591049286190124'], 4)
// )
