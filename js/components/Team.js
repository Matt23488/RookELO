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
        this._average = NaN;
        this._transform = NaN;
        this._expected = NaN;
    }

    get events() { return this._events; }

    get player1() { return this._player1; }
    set player1(player) {
        this._player1 = player;

        if (player !== undefined) {
            getPlayerContainer(this, "player1").appendChild(player.element);
        }
        
        this._events.emit("newPlayer");
    }

    get player2() { return this._player2; }
    set player2(player) {
        this._player2 = player;

        if (player !== undefined) {
            getPlayerContainer(this, "player2").appendChild(player.element);
        }
        
        this._events.emit("newPlayer");
    }

    get player1Container() { return this._player1Container; }
    get player2Container() { return this._player2Container; }

    get average() { return this._average; }
    set average(value) {
        this._average = value;
        this.element.getElementsByClassName("average-display").item(0).innerText = value;
        getTeamSection(this, "average").classList.toggle("hidden", isNaN(value));
        
    }
    
    get transform() { return this._transform; }
    set transform(value) {
        this._transform = value;
        this.element.getElementsByClassName("transform-display").item(0).innerText = value;
        getTeamSection(this, "transform").classList.toggle("hidden", isNaN(value));
    }
    
    get expected() { return this._expected; }
    set expected(value) {
        this._expected = value;
        this.element.getElementsByClassName("expected-display").item(0).innerText = value;
        getTeamSection(this, "expected").classList.toggle("hidden", isNaN(value));
    }
}

function getPlayerContainer(team, playerSelection) {
    return team.element.getElementsByClassName(playerSelection).item(0).getElementsByClassName("player-container").item(0);
}

function getTeamSection(team, section) {
    return team.element.getElementsByClassName(`${section}-section`).item(0);
}