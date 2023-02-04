import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/Game';

declare global {
  interface Window {
    state: any;
    events: any;
    ws: any;
    me: any;
  }
}


window.ws = new WebSocket('ws://localhost:8080');
ws.onopen = event => {
  const login_input = document.getElementById("login-input");
  login_input?.removeAttribute("disabled");
  login_input?.focus();
  login_input?.addEventListener("keydown", event => {
    if (event.code === "Enter") {
      const token = (login_input as HTMLInputElement).value
      ws.send(JSON.stringify({ type: "login", data: { token } }));
      login_input.setAttribute("disabled", "true");
    }
  })
}

ws.onmessage = event => {
  const message = JSON.parse(event.data);
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



