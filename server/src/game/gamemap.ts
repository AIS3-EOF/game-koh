import { GameObject } from "@/game_objects/game_object"
import { Chest } from "@/maps/chest"
import { Ground as Floor } from "../maps/ground"
import { Wall } from "../maps/wall"
import { MapObject } from "@/maps/map_object"
import { Vec2 } from "@/protocol/shared"


export class GameMap {
	tiles: MapObject[][] = []
	chest_positions: Vec2[] = []
	width: number = 256
	height: number = 256

	constructor(width: number, height: number) {}

	static generate(width: number, height: number, minRoomSize = 5, maxRoomSize = 15): GameMap {
		const map = new GameMap(width, height)
		let maze = [];
		for (let i = 0; i < height; i++) {
			let row = [];
			for (let j = 0; j < width; j++) {
				row.push(1);
			}
			maze.push(row);
		}

		let stack = [];
		let currentCell = [Math.floor(Math.random() * (height - 1) / 2) * 2 + 1, Math.floor(Math.random() * (width - 1) / 2) * 2 + 1];
		maze[currentCell[0]][currentCell[1]] = 0;

		let directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];

		while (stack.length > 0 || currentCell) {
			let unvisitedNeighbors = [];
			for (let direction of directions) {
				let x = currentCell[0] + direction[0];
				let y = currentCell[1] + direction[1];
				if (x > 0 && x < height - 1 && y > 0 && y < width - 1 && maze[x][y] === 1) {
				unvisitedNeighbors.push(direction);
			}
		}
		
		if (unvisitedNeighbors.length > 0) {
			let randomIndex = Math.floor(Math.random() * unvisitedNeighbors.length);
			let nextCell = [currentCell[0] + unvisitedNeighbors[randomIndex][0], currentCell[1] + unvisitedNeighbors[randomIndex][1]];
			stack.push(currentCell);
			maze[(currentCell[0] + nextCell[0]) / 2][(currentCell[1] + nextCell[1]) / 2] = 0;
			currentCell = nextCell;
			maze[currentCell[0]][currentCell[1]] = 0;
			} else if (stack.length > 0) {
				currentCell = stack.pop()!;
			} else {
				currentCell = null!;
			}
		}

		// generate rooms
		for (let i = 0; i < 500; i++) {
			let roomWidth = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
			let roomHeight = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
			let roomX = Math.floor(Math.random() * (width - roomWidth));
			let roomY = Math.floor(Math.random() * (height - roomHeight));
			for (let x = roomX; x < roomX + roomWidth; x++) {
				for (let y = roomY; y < roomY + roomHeight; y++) {
					// check boundary
					if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
						continue
					}
					maze[x][y] = 0;
				}
			}

			for (let x = roomX; x < roomX + roomWidth; x++) {
				for (let y = roomY; y < roomY + roomHeight; y++) {
					if (Math.random() < 0.05 && x > 1 && y > 1 && x < width - 2 && y < height - 2) {
						if (Math.random() < 0.2 ) {
							maze[x][y] = 1
							maze[x + 1][y] = 1
							maze[x][y + 1] = 1
							maze[x + 1][y + 1] = 1
						} else if (Math.random() < 0.3) {
							maze[x][y] = 1
							maze[x + 1][y] = 1
							maze[x - 1][y] = 1
						} else if (Math.random() < 0.3) {
							maze[x][y] = 1
							maze[x][y + 1] = 1
							maze[x][y - 1] = 1
						} else if (Math.random() < 0.25) {
							maze[x][y] = 1
						}
					}
				}
			}
		}

		// randomly remove 20% walls
		for (let i = 1; i < height - 1; i++) {
			for (let j = 1; j < width - 1; j++) {
				if (maze[i][j] === 1) {
					if (Math.random() < 0.30) {
						maze[i][j] = 0
					} 
				}
			}
		}

		for (let i = 1; i < height - 1; i++) {
			for (let j = 1; j < width - 1; j++) {
				if (maze[i][j] === 0 && Math.random() < 0.05) {
					if (Math.random() < 0.1) {
						maze[i][j] = 1
					} 
				}
			}
		}


		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				if (maze[i][j] === 1) {
					map.tiles[i] = map.tiles[i] ?? []
					map.tiles[i][j] = new Wall([i, j])
				} else {
					map.tiles[i] = map.tiles[i] ?? []
					map.tiles[i][j] = new Floor([i, j])
				}
			}
		}

		return map
	}

	canMoveTo(pos: Vec2) : boolean {
		// check if out of bounds
		if (pos == null || pos[0] < 0 || pos[1] < 0 || pos[0] >= this.width || pos[1] >= this.height) {	
			return false
		}

		// check if tile is walkable
		const tile = this.getTile(pos) as MapObject
		if (!tile.can_walk) {
			return false
		}
		return true
	}

	getTile(pos: Vec2) {
		return this.tiles.at(pos[0])?.at(pos[1])
	}

	getRandomSpawnPosition() : Vec2 {
		const pos = [Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height)]

		// check if tile is walkable
		const tile = this.getTile(pos as Vec2) as MapObject
		if (!tile.can_walk) {
			return this.getRandomSpawnPosition()
		}
		return pos as Vec2
	}

	// randomly choose chest position and put it in the chest inventory
	dropGameObject(game_object: GameObject) {
		const pos = this.chest_positions[Math.floor(Math.random() * this.chest_positions.length)]
		if (!pos) return
		const chest = this.getTile(pos) as Chest
		chest.chest_inventory.push(game_object)
	}
}
