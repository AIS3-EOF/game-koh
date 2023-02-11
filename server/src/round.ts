export enum RoundStatus {
	PREINIT = 'Preinit',
	INIT = 'Initializing',
	RUNNING = 'Running',
	END = 'Ended',
}

export const RoundMessage = {
	[RoundStatus.PREINIT]: 'not initialized',
	[RoundStatus.INIT]: 'not started',
	[RoundStatus.RUNNING]: 'running',
	[RoundStatus.END]: 'ended',
}

export const ExpectedRoundStatus = {
	[RoundStatus.PREINIT]: [RoundStatus.INIT],
	[RoundStatus.INIT]: [RoundStatus.PREINIT, RoundStatus.RUNNING],
	[RoundStatus.RUNNING]: [RoundStatus.END],
	[RoundStatus.END]: [RoundStatus.PREINIT, RoundStatus.INIT],
}

export interface RoundData {
	id: number
	status: RoundStatus
	start: string | null
	end: string | null
}

export const InitRoundData: RoundData = {
	id: -1,
	status: RoundStatus.PREINIT,
	start: null,
	end: null,
}
