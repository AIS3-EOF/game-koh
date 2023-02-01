import { GameObject } from "../game_objects/game_object"
import { Chest } from "../maps/chest"
import { MapObject } from "../maps/map_object"
import { Vec2 } from "../protocol/shared"


export class GameMap {
	private tiles: MapObject[][] = []
	private chest_positions: Vec2[] = []

	private constructor(private width: number, private height: number) {}
	static generate(width: number, height: number): GameMap {
		// map generationq
		const map = new GameMap(width, height)
		map.tiles = Array.from({ length: height }, (_, i) =>
			Array.from({ length: width }, (_, j) =>
				// TODO: map generation algorithm
				new MapObject([i, j])
			)
		)
		return map
	}

	getTile(pos: Vec2): MapObject {
		return this.tiles[pos[0]][pos[1]]
	}

	// randomly choose chest position and put it in the chest inventory
	dropGameObject(game_object: GameObject) {
		const pos = this.chest_positions[Math.floor(Math.random() * this.chest_positions.length)]
		const chest = this.getTile(pos) as Chest
		chest.chest_inventory.push(game_object)
	}
}
