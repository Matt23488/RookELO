import Component from "./Component.js";
import Events from "../Events.js";

export default class TeamComponent extends Component {
    constructor(id) {
        super(document.getElementById(id));

        this._events = new Events();
        this._player1 = undefined;
        this._player2 = undefined;
        this._player1Container = getPlayerContainer(this, "player1");
        this._player2Container = getPlayerContainer(this, "player2");

        // Move these to EloManager? Since some of the drag/drop flow has to be there,
        // maybe I can move it all there, to keep it in one place. Will try that.
        const player1Container = getPlayerContainer(this, "player1");
        player1Container.addEventListener("dragover", ev => {
            ev.preventDefault();
        });
        player1Container.addEventListener("drop", ev => {
            ev.preventDefault();
            const playerId = ev.dataTransfer.getData("text");
            this.events.emit("addPlayer1", parseInt(playerId));
        });

        const player2Container = getPlayerContainer(this, "player2");
        player2Container.addEventListener("dragover", ev => {
            ev.preventDefault();
        });
        player2Container.addEventListener("drop", ev => {
            ev.preventDefault();
            const playerId = ev.dataTransfer.getData("text");
            this.events.emit("addPlayer2", parseInt(playerId));
        });
    }

    get events() { return this._events; }

    get player1() { return this._player1; }
    set player1(player) {
        this._player1 = player;

        if (player !== undefined) {
            getPlayerContainer(this, "player1").appendChild(player.element);
        }
    }

    get player2() { return this._player2; }
    set player2(player) {
        this._player2 = player;

        if (player !== undefined) {
            getPlayerContainer(this, "player2").appendChild(player.element);
        }
    }

    get player1Container() { return this._player1Container; }
    get player2Container() { return this._player2Container; }
}

function getPlayerContainer(team, playerSelection) {
    return team.element.getElementsByClassName(playerSelection).item(0).getElementsByClassName("player-container").item(0);
}