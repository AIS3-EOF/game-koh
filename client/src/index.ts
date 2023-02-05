import Phaser from 'phaser';
import config from '@/config';
import GameScene from '@/scenes/Game';
import Map from '@/resources/map'

import parser from 'parser'

import { ClientMessage, ServerMessage, Player } from '@/types'

declare global {
  interface Window {
    state: any
    events: ClientMessage[]
    ws: WebSocket
    me: Player
    gameMap: Map
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
        window.gameMap = new Map(message.data.map)
        let mapJSON = window.gameMap.getJSON()
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
    case "interact_map":
    case "use":
      window.events.push(message);
      break;
    default:
  }
}



