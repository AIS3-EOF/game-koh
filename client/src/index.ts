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

window.ws.onmessage = event => {
  const message = parser.parse(event.data) as ClientMessage
  switch (message.type) {
    case "login":
      if (message.data.success === true) {
        document.getElementById("login-container")?.remove();

        //Create a empty event queue
        window.events = [];

        //Init Game
        new Phaser.Game(
          Object.assign(config, {
            scene: [GameScene]
          })
        );

        //spawn player

      } else {
        const login_input = document.getElementById("login-input");
        login_input?.removeAttribute("disabled");
        // show some error message
        // document.getElementById("login-error-message").innerText = "Login Failed";
      }
      break;
    case "init":
    case "join":
    case "move":
      window.events.push(message);
      break;
    default:
  }
}



