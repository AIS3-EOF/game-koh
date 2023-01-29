import { MapObject } from "../maps/map_object"


export class GameMap {
	private tiles: MapObject[][] = []
	private constructor(private width: number, private height: number) {}
	static generate(width: number, height: number): GameMap {
		// map generation
		const map = new GameMap(width, height)
		map.tiles = Array.from({ length: height }, (_, i) =>
			Array.from({ length: width }, (_, j) =>
				new MapObject([i, j])
			)
		)
		return map
	}
}
