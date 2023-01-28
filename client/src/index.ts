import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/Game';

declare global {
  interface Window { events: any; }
}


const ws = new WebSocket('ws://localhost:8080');
ws.onopen = event => {
  const login_input = document.getElementById("login-input");
  login_input?.removeAttribute("disabled");
  login_input?.addEventListener("keydown", event => {
    if(event.code === "Enter"){
      const token = (login_input as HTMLInputElement).value
      ws.send(JSON.stringify({type: "login", data: { token } }));
      login_input.setAttribute("disabled", "true");
    }
  })
}

ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if(message.type === "login"){
    if(message.data.success === true){
      document.getElementById("login-container")?.remove();
      
      //Create a empty event queue
      window.events = [];

      //Init Game
      new Phaser.Game(
        Object.assign(config, {
          scene: [GameScene]
        })
      );
    }else{
      const login_input = document.getElementById("login-input");
      login_input?.removeAttribute("disabled");
      // show some error message
      // document.getElementById("login-error-message").innerText = "Login Failed";
    }
  }else if(message.type === "event"){
    // handle event
    console.log("Receive event", message);
    window.events.push(message.data);
  }else if(message.type === "sync"){
    // We dont need sync anymore
  }
}



