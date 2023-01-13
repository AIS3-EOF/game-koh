type MapObject = null

export class GameMap {
	private tiles: MapObject[][] = []
	private constructor(private width: number, private height: number) {}
	static generate(width: number, height: number): GameMap {
		// map generation
		const map = new GameMap(width, height)
		map.tiles = Array.from({ length: height }, () => Array.from({ length: width }, () => null))
		return map
	}
}
