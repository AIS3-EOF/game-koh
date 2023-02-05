import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/Game';

import parser from '../../parser'

import { ClientMessage, ServerMessage, Player } from './types'

declare global {
  interface Window {
    state: any
    events: ClientMessage[]
    ws: WebSocket
    me: Player
    send: (message: ServerMessage) => void
  }
}

window.send = (message: ServerMessage) => {
  return window.ws.send(parser.stringify(message))
}

window.ws = new WebSocket('ws://localhost:8080');
window.ws.onopen = event => {
  const login_input = document.getElementById("login-input");
  if (!login_input) return;
  login_input.removeAttribute("disabled");
  login_input.focus();
  login_input.addEventListener("keydown", event => {
    if (event.code === "Enter") {
      const token = (login_input as HTMLInputElement).value
      window.send({ type: "login", data: { token } });
      login_input.setAttribute("disabled", "true");
    }
  })
}
window.ws.onclose = event => {
  // TODO: replace alert with something better
  window.send = () => { }
  if (confirm("Connection closed"))
    location.reload()
}

window.ws.onmessage = event => {
  const message = parser.parse(event.data) as ClientMessage
  switch (message.type) {
    case "login":
      if (message.data.success === true) {
        document.getElementById("login-container")?.remove();

        //Create a empty event queue
        window.events = [];

      } else {
        const login_input = document.getElementById("login-input");
        login_input?.removeAttribute("disabled");
        // show some error message
        // document.getElementById("login-error-message").innerText = "Login Failed";
      }
      break;
    case "init":
        let _map = message.data.map;
        _map.tiles = _map.tiles[0].map((_: any, colIndex: number) => _map.tiles.map((row: any)=> row[colIndex as number]));
        const mapJSON = {
            "height": _map.height,
            "width": _map.width,
            "layers":[
                {
                    "data": _map.tiles.flat().map(x=>(
                      {
                        'ground': 1,
                        'wall': 2,
                        'chest': 3
                      }[x['texture']]
                    )),
                    "height": _map.height,
                    "width": _map.width,
                    "name":"Ground",
                    "opacity":1,
                    "type":"tilelayer",
                    "visible":true,
                    "x":0,
                    "y":0
                },
                {
                    "data": [1,2,3,9,10,11,17,18,19],
                    "height":3,
                    "width":3,
                    "name":"Desert_ground",
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
                    "image":"tmw_desert_spacing.png",
                    "imageheight":199,
                    "imagewidth":265,
                    "margin":0,
                    "name":"Desert",
                    "properties":{},
                    "spacing":1,
                    "tileheight":32,
                    "tilewidth":32
                }
            ],
            "version":1
        }
        window.sessionStorage.setItem('map', JSON.stringify(mapJSON))
        //Init Game
        new Phaser.Game(
          Object.assign(config, {
            scene: [GameScene]
          })
        );
    case "join":
    case "move":
    case "attack":
      window.events.push(message);
      break;
    default:
  }
}



