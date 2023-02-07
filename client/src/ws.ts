import Phaser from 'phaser'
import parser from 'parser'
import config from '@/config';
import GameMap from '@/resources/map'
import { ClientMessage, ServerMessage } from '@/types'

function onopen(event: Event) {
    const login_input = document.getElementById("login-input");
    if (!login_input) return;
    login_input.removeAttribute("disabled");
    login_input.focus();
    login_input.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === "NumpadEnter") {
            const token = (login_input as HTMLInputElement).value
            window.send({ type: "login", data: { token } });
            login_input.setAttribute("disabled", "true");
        }
    })
}

function onclose(event: CloseEvent) {
    window.send = () => { }
    // TODO: replace alert with something better
    if (confirm("Connection closed"))
        location.reload()
}

function onmessage(event: MessageEvent<string>) {
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
            window.gameMap = new GameMap(message.data.map)
            let mapJSON = window.gameMap.getJSON()
            window.sessionStorage.setItem('map', JSON.stringify(mapJSON))
            //Init Game
            new Phaser.Game(config)
            window.me = message.data.player.identifier
            break;

        default:
    }
    if (message.type !== "login") {
        window.events.push(message)
        document.dispatchEvent(new CustomEvent("event", { detail: message }))
    }
}

export function setupWS(url: string | URL) {
    const ws = new WebSocket(url);
    ws.onopen = onopen
    ws.onclose = onclose
    ws.onmessage = onmessage

    window.send = (message: ServerMessage) => {
        return ws.send(parser.stringify(message))
    }
}