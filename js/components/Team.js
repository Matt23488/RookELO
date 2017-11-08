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
        this._ifWon = NaN;
        this._ifLoss = NaN;
        this._player1ScoreIncrease = NaN;
        this._player2ScoreIncrease = NaN;
        this._player1ScoreIfWon = NaN;
        this._player2ScoreIfWon = NaN;
        this._player1ScoreDecrease = NaN;
        this._player2ScoreDecrease = NaN;
        this._player1ScoreIfLoss = NaN;
        this._player2ScoreIfLoss = NaN;
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
        getTeamSection(this, "average").classList.toggle("HIDDEN", isNaN(value));
        
    }
    
    get transform() { return this._transform; }
    set transform(value) {
        this._transform = value;
        this.element.getElementsByClassName("transform-display").item(0).innerText = value;
        //getTeamSection(this, "transform").classList.toggle("HIDDEN", isNaN(value));
    }
    
    get expected() { return this._expected; }
    set expected(value) {
        this._expected = value;
        this.element.getElementsByClassName("expected-display").item(0).innerText = parseFloat(Math.round(value * 10000) / 100).toFixed(2);
        getTeamSection(this, "expected").classList.toggle("HIDDEN", isNaN(value));
    }
    
    get ifWon() { return this._ifWon; }
    set ifWon(value) {
        this._ifWon = value;
        this.element.getElementsByClassName("if-won-display").item(0).innerText = value;
        getTeamSection(this, "hypothetical").classList.toggle("HIDDEN", isNaN(value));
    }

    get ifLoss() { return this._ifLoss; }
    set ifLoss(value) {
        this._ifLoss = value;
        this.element.getElementsByClassName("if-loss-display").item(0).innerText = value;
    }

    get player1ScoreIncrease() { return this._player1ScoreIncrease; }
    set player1ScoreIncrease(value) {
        this._player1ScoreIncrease = value;
        this.element.getElementsByClassName("player1-increase-display").item(0).innerText = value;
        getTeamSection(this, "score-increase").classList.toggle("HIDDEN", isNaN(value));
    }

    get player2ScoreIncrease() { return this._player2ScoreIncrease; }
    set player2ScoreIncrease(value) {
        this._player2ScoreIncrease = value;
        this.element.getElementsByClassName("player2-increase-display").item(0).innerText = value;
        getTeamSection(this, "score-increase").classList.toggle("HIDDEN", isNaN(value));
    }

    get player1ScoreIfWon() { return this._player1ScoreIfWon; }
    set player1ScoreIfWon(value) {
        this._player1ScoreIfWon = value;
        getTeamSection(this, "score-increase").getElementsByClassName("player1-new-score-display").item(0).innerText = value;
    }

    get player2ScoreIfWon() { return this._player2ScoreIfWon; }
    set player2ScoreIfWon(value) {
        this._player2ScoreIfWon = value;
        getTeamSection(this, "score-increase").getElementsByClassName("player2-new-score-display").item(0).innerText = value;
    }

    get player1ScoreDecrease() { return this._player1ScoreDecrease; }
    set player1ScoreDecrease(value) {
        this._player1ScoreDecrease = value;
        this.element.getElementsByClassName("player1-decrease-display").item(0).innerText = value;
        getTeamSection(this, "score-decrease").classList.toggle("HIDDEN", isNaN(value));
    }

    get player2ScoreDecrease() { return this._player2ScoreDecrease; }
    set player2ScoreDecrease(value) {
        this._player2ScoreDecrease = value;
        this.element.getElementsByClassName("player2-decrease-display").item(0).innerText = value;
        getTeamSection(this, "score-decrease").classList.toggle("HIDDEN", isNaN(value));
    }

    get player1ScoreIfLoss() { return this._player1ScoreIfLoss; }
    set player1ScoreIfLoss(value) {
        this._player1ScoreIfLoss = value;
        getTeamSection(this, "score-decrease").getElementsByClassName("player1-new-score-display").item(0).innerText = value;
    }

    get player2ScoreIfLoss() { return this._player2ScoreIfLoss; }
    set player2ScoreIfLoss(value) {
        this._player2ScoreIfLoss = value;
        getTeamSection(this, "score-decrease").getElementsByClassName("player2-new-score-display").item(0).innerText = value;
    }
}

function getPlayerContainer(team, playerSelection) {
    return team.element.getElementsByClassName(playerSelection).item(0).getElementsByClassName("player-container").item(0);
}

function getTeamSection(team, section) {
    return team.element.getElementsByClassName(`${section}-section`).item(0);
}