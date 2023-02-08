export type ManagerEvent =
	| 'round_init'
	| 'round_start'
	| 'round_end'
	| 'round_tick'
	| 'check_death'

export enum RoundStatus {
	PREINIT = 'preinit',
	INIT = 'init',
	RUNNING = 'running',
	END = 'end',
}

export interface RoundData {
	number: number
	status: RoundStatus
}
