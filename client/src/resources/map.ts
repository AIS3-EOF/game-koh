import { MapObject } from '@/types'

export default class GameMap{
    public tiles: any
    public tilesData: any
    public topTilesData: any
    public chests: any
    public height: any
    public width: any
    constructor(map: any){
        this.tiles = map.tiles
        this.height = map.height
        this.width = map.width

        
        // x, y transpose
        this.tiles = this.tiles[0].map((_: any, colIndex: number) => this.tiles.map((row: MapObject[])=> row[colIndex]))
        // 
        this.generateTilesData()
    }
    
    generateTilesData(){
        this.tilesData = []
        this.topTilesData = []
        for(let i = 0; i < this.height; i++){
            for(let j = 0; j < this.width; j++){
                if (this.tiles[i][j]['texture'] === 'chest'){
                    this.tilesData.push(456)
                } else if (this.tiles[i][j]['texture'] === 'ground'){
                    let randommFloor = 466
                    if(Math.random() < 0.05){
                        randommFloor = 455
                    } else if (Math.random() < 0.05){
                        randommFloor = 488
                    }
                    this.tilesData.push(randommFloor)
                } else if( i == 0 ){
                    // ceiling wall
                    if ( j == 0 ){
                        this.tilesData.push(226)
                    } else if (j == this.width - 1){
                        this.tilesData.push(228)
                    } else{
                        this.tilesData.push(211 + j % 13)
                    }
                } else if ( i == this.height -1 ){
                    // floor wall
                    if ( j == 0 ){
                        this.tilesData.push(342)
                    } else if (j == this.width - 1){
                        this.tilesData.push(344)
                    } else{
                        this.tilesData.push(331 + j % 10)
                    }
                } else if ( j == 0 ){
                    // left wall
                    this.tilesData.push(416 + (i%3) * 30)
                } else if ( j == this.width - 1 ){
                    // right wall
                    this.tilesData.push(418 + (i%3) * 30)
                } else if ( this.tiles[i+1][j]['texture'] === 'wall' && this.tiles[i-1][j]['texture'] === 'wall' && this.tiles[i][j+1]['texture'] === 'wall' && this.tiles[i][j-1]['texture'] === 'wall'){ // all wall
                    this.tilesData.push(108)
                } else if ( this.tiles[i+1][j]['texture'] === 'wall' && this.tiles[i-1][j]['texture'] !== 'wall' && this.tiles[i][j+1]['texture'] !== 'wall' && this.tiles[i][j-1]['texture'] !== 'wall'){ // only down wall
                    this.tilesData.push(4)
                } else if ( this.tiles[i+1][j]['texture'] !== 'wall' && this.tiles[i-1][j]['texture'] === 'wall' && this.tiles[i][j+1]['texture'] !== 'wall' && this.tiles[i][j-1]['texture'] !== 'wall'){ // only up wall
                    this.tilesData.push(102)
                } else if ( this.tiles[i+1][j]['texture'] !== 'wall' && this.tiles[i-1][j]['texture'] !== 'wall' && this.tiles[i][j+1]['texture'] === 'wall' && this.tiles[i][j-1]['texture'] !== 'wall'){ // only right wall
                    this.tilesData.push(286)
                } else if ( this.tiles[i+1][j]['texture'] !== 'wall' && this.tiles[i-1][j]['texture'] !== 'wall' && this.tiles[i][j+1]['texture'] !== 'wall' && this.tiles[i][j-1]['texture'] === 'wall'){ // only left wall
                    this.tilesData.push(288)
                } else if ( this.tiles[i+1][j]['texture'] !== 'wall' && this.tiles[i-1][j]['texture'] === 'wall' && this.tiles[i][j+1]['texture'] === 'wall' && this.tiles[i][j-1]['texture'] === 'wall'){ // only down not wall
                    this.tilesData.push(106)
                } else if ( this.tiles[i+1][j]['texture'] === 'wall' && this.tiles[i-1][j]['texture'] !== 'wall' && this.tiles[i][j+1]['texture'] === 'wall' && this.tiles[i][j-1]['texture'] === 'wall'){ // only up not wall
                    this.tilesData.push(174)
                } else if ( this.tiles[i+1][j]['texture'] === 'wall' && this.tiles[i-1][j]['texture'] === 'wall' && this.tiles[i][j+1]['texture'] !== 'wall' && this.tiles[i][j-1]['texture'] === 'wall'){ // only right not wall
                    this.tilesData.push(354)
                } else if ( this.tiles[i+1][j]['texture'] === 'wall' && this.tiles[i-1][j]['texture'] === 'wall' && this.tiles[i][j+1]['texture'] === 'wall' && this.tiles[i][j-1]['texture'] !== 'wall'){ // only left not wall
                    this.tilesData.push(234)
                } else if ( this.tiles[i+1][j]['texture'] !== 'wall' && this.tiles[i-1][j]['texture'] !== 'wall' && this.tiles[i][j+1]['texture'] === 'wall' && this.tiles[i][j-1]['texture'] === 'wall'){ // left right wall
                    this.tilesData.push(271 + j % 13)
                } else if ( this.tiles[i+1][j]['texture'] === 'wall' && this.tiles[i-1][j]['texture'] === 'wall' && this.tiles[i][j+1]['texture'] !== 'wall' && this.tiles[i][j-1]['texture'] !== 'wall'){ // up down wall
                    this.tilesData.push(450 + (i%2) * 30)
                } else if ( this.tiles[i+1][j]['texture'] !== 'wall' && this.tiles[i-1][j]['texture'] === 'wall' && this.tiles[i][j+1]['texture'] === 'wall' && this.tiles[i][j-1]['texture'] !== 'wall' && this.tiles[i-1][j+1]['texture'] === 'wall'){ // right up rihgtup wall
                    this.tilesData.push(160)
                } else if ( this.tiles[i+1][j]['texture'] !== 'wall' && this.tiles[i-1][j]['texture'] === 'wall' && this.tiles[i][j+1]['texture'] === 'wall' && this.tiles[i][j-1]['texture'] !== 'wall' && this.tiles[i-1][j+1]['texture'] !== 'wall'){ // right up wall
                    this.tilesData.push(158)
                } else if ( this.tiles[i+1][j]['texture'] !== 'wall' && this.tiles[i-1][j]['texture'] === 'wall' && this.tiles[i][j+1]['texture'] !== 'wall' && this.tiles[i][j-1]['texture'] === 'wall' && this.tiles[i-1][j-1]['texture'] === 'wall'){ // left up leftup wall
                    this.tilesData.push(162)
                } else if ( this.tiles[i+1][j]['texture'] !== 'wall' && this.tiles[i-1][j]['texture'] === 'wall' && this.tiles[i][j+1]['texture'] !== 'wall' && this.tiles[i][j-1]['texture'] === 'wall' && this.tiles[i-1][j-1]['texture'] !== 'wall'){ // left up  wall
                    this.tilesData.push(164)
                } else if ( this.tiles[i+1][j]['texture'] === 'wall' && this.tiles[i-1][j]['texture'] !== 'wall' && this.tiles[i][j+1]['texture'] === 'wall' && this.tiles[i][j-1]['texture'] !== 'wall' && this.tiles[i+1][j+1]['texture'] === 'wall'){ // right down rightdown wall
                    this.tilesData.push(176)
                } else if ( this.tiles[i+1][j]['texture'] === 'wall' && this.tiles[i-1][j]['texture'] !== 'wall' && this.tiles[i][j+1]['texture'] === 'wall' && this.tiles[i][j-1]['texture'] !== 'wall' && this.tiles[i+1][j+1]['texture'] !== 'wall'){ // right down wall
                    this.tilesData.push(178)
                } else if ( this.tiles[i+1][j]['texture'] === 'wall' && this.tiles[i-1][j]['texture'] !== 'wall' && this.tiles[i][j+1]['texture'] !== 'wall' && this.tiles[i][j-1]['texture'] === 'wall' && this.tiles[i+1][j-1]['texture'] === 'wall'){ // left down leftdown wall
                    this.tilesData.push(296)
                } else if ( this.tiles[i+1][j]['texture'] === 'wall' && this.tiles[i-1][j]['texture'] !== 'wall' && this.tiles[i][j+1]['texture'] !== 'wall' && this.tiles[i][j-1]['texture'] === 'wall' && this.tiles[i+1][j-1]['texture'] !== 'wall'){ // left down wall
                    this.tilesData.push(298)
                } else{
                    this.tilesData.push(100)
                }

                // update topTilesData
                this.topTilesData.push(this.tiles[i][j]['texture'] === 'wall'? this.tilesData[i*this.height + j]: null)
            }
        }
    }

    getJSON(){
        const mapJSON = {
            "height": this.height,
            "width": this.width,
            "layers":[
                {
                    "data": this.tilesData,
                    "height": this.height,
                    "width": this.width,
                    "name":"Ground",
                    "opacity":1,
                    "type":"tilelayer",
                    "visible":true,
                    "x":0,
                    "y":0
                },
                {
                    "data": this.topTilesData,
                    "height": this.height,
                    "width": this.width,
                    "name":"Top",
                    "opacity":1,
                    "type":"tilelayer",
                    "visible":true,
                    "x":0,
                    "y":0
                }
            ],
            "orientation":"orthogonal",
            "properties":{},
            "tileheight":32,
            "tilewidth":32,
            "tilesets":[
                {
                    "firstgid":1,
                    "image":"tiles.png",
                    "imageheight":32,
                    "imagewidth":64,
                    "margin":0,
                    "name":"Maze",
                    "properties":{},
                    "spacing":0,
                    "tileheight":32,
                    "tilewidth":32
                },
                {
                    "firstgid":1,
                    "image":"lab.png",
                    "imageheight":576,
                    "imagewidth":960,
                    "margin":0,
                    "name":"Lab",
                    "properties":{},
                    "spacing":1,
                    "tileheight":32,
                    "tilewidth":32
                }
            ],
            "version":1
        }
        return mapJSON
    }
}