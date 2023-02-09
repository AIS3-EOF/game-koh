import { GameObject } from '~/game_objects/game_object'
import { MapObject, MapObjectType, MapObjectClass, Chest } from '~/maps'
import { Vec2 } from '~/protocol'
import { CHEST_SIZE, ROOM_SIZE } from '~/config'

export class GameMap {
	tiles: MapObject[][] = []
	chest_positions: Vec2[] = []

	constructor(
		public width: number,
		public height: number,
		minRoomSize = 5,
		maxRoomSize = 15,
	) {
		// Randomized DFS to generate a maze
		let maze = Array.from({ length: height }, () =>
			Array.from({ length: width }, () => MapObjectType.Wall),
		)

		let stack = []
		let currentCell = [
			Math.floor((Math.random() * (height - 1)) / 2) * 2 + 1,
			Math.floor((Math.random() * (width - 1)) / 2) * 2 + 1,
		]
		maze[currentCell[0]][currentCell[1]] = MapObjectType.Ground

		let directions = [
			[-2, 0],
			[2, 0],
			[0, -2],
			[0, 2],
		]

		while (stack.length > 0 || currentCell) {
			let unvisitedNeighbors = []
			for (let direction of directions) {
				let x = currentCell[0] + direction[0]
				let y = currentCell[1] + direction[1]
				if (
					x > 0 &&
					x < height - 1 &&
					y > 0 &&
					y < width - 1 &&
					maze[x][y] === 1
				) {
					unvisitedNeighbors.push(direction)
				}
			}

			if (unvisitedNeighbors.length > 0) {
				let randomIndex = Math.floor(
					Math.random() * unvisitedNeighbors.length,
				)
				let nextCell = [
					currentCell[0] + unvisitedNeighbors[randomIndex][0],
					currentCell[1] + unvisitedNeighbors[randomIndex][1],
				]
				stack.push(currentCell)
				maze[(currentCell[0] + nextCell[0]) / 2][
					(currentCell[1] + nextCell[1]) / 2
				] = 0
				currentCell = nextCell
				maze[currentCell[0]][currentCell[1]] = 0
			} else if (stack.length > 0) {
				currentCell = stack.pop()!
			} else {
				currentCell = null!
			}
		}

		// Generate rooms
		for (let i = 0; i < ROOM_SIZE; i++) {
			let roomWidth =
				Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) +
				minRoomSize
			let roomHeight =
				Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) +
				minRoomSize
			let roomX = Math.floor(Math.random() * (width - roomWidth))
			let roomY = Math.floor(Math.random() * (height - roomHeight))
			for (let x = roomX; x < roomX + roomWidth; x++) {
				for (let y = roomY; y < roomY + roomHeight; y++) {
					// check boundary
					if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
						continue
					}
					maze[x][y] = MapObjectType.Ground
				}
			}

			// Carve room details
			for (let x = roomX; x < roomX + roomWidth; x++) {
				for (let y = roomY; y < roomY + roomHeight; y++) {
					if (
						Math.random() < 0.05 &&
						x > 1 &&
						y > 1 &&
						x < width - 2 &&
						y < height - 2
					) {
						if (Math.random() < 0.2) {
							maze[x][y] = MapObjectType.Wall
							maze[x + 1][y] = MapObjectType.Wall
							maze[x][y + 1] = MapObjectType.Wall
							maze[x + 1][y + 1] = MapObjectType.Wall
						} else if (Math.random() < 0.3) {
							maze[x][y] = MapObjectType.Wall
							maze[x + 1][y] = MapObjectType.Wall
							maze[x - 1][y] = MapObjectType.Wall
						} else if (Math.random() < 0.3) {
							maze[x][y] = MapObjectType.Wall
							maze[x][y + 1] = MapObjectType.Wall
							maze[x][y - 1] = MapObjectType.Wall
						} else if (Math.random() < 0.25) {
							maze[x][y] = MapObjectType.Wall
						}
					}
				}
			}
		}

		// randomly remove/add few walls
		for (let i = 1; i < height - 1; i++)
			for (let j = 1; j < width - 1; j++)
				if (maze[i][j] === MapObjectType.Wall && Math.random() < 0.3)
					maze[i][j] = MapObjectType.Ground

		for (let i = 1; i < height - 1; i++)
			for (let j = 1; j < width - 1; j++)
				if (
					maze[i][j] === MapObjectType.Ground &&
					Math.random() < 0.05 &&
					Math.random() < 0.1
				)
					maze[i][j] = MapObjectType.Wall

		for (let k = 0; k < CHEST_SIZE; k++) {
			const x = Math.floor(Math.random() * (width - 2)) + 1
			const y = Math.floor(Math.random() * (height - 2)) + 1
			if (maze[x][y] !== MapObjectType.Ground) {
				k--
				continue
			}
			maze[x][y] = MapObjectType.Chest
			this.chest_positions.push([x, y])
		}

		this.tiles = maze.map((row, i) =>
			row.map((col, j) => new (MapObjectClass.get(col))([i, j])),
		)
	}

	canMoveTo(pos: Vec2): boolean {
		// check if out of bounds
		if (
			pos == null ||
			pos[0] < 0 ||
			pos[1] < 0 ||
			pos[0] >= this.width ||
			pos[1] >= this.height
		) {
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

	getRandomSpawnPosition(): Vec2 {
		// TEST CODE: limited spawn positions
		// return [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)]
		while (true) {
			const pos = [
				Math.floor(Math.random() * this.width),
				Math.floor(Math.random() * this.height),
			]
			// check if tile is walkable
			const tile = this.getTile(pos as Vec2) as MapObject
			if (tile.can_walk) return pos as Vec2
		}
	}

	// randomly choose chest position and put it in the chest inventory
	dropGameObject(game_object: GameObject) {
		const pos =
			this.chest_positions[
				Math.floor(Math.random() * this.chest_positions.length)
			]
		if (!pos) return
		const chest = this.getTile(pos) as Chest

		if (game_object.isRare) chest.chest_inventory_rare.push(game_object)
		else chest.chest_inventory.push(game_object)

		// TEST CODE: Place game_object into all chests
		// this.chest_positions.forEach(element => {
		// 	let chest = this.getTile(element) as Chest
		// 	chest.chest_inventory.push(game_object)
		// });
	}
}
