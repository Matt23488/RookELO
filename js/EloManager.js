import PlayerList from "./components/PlayerList.js";
import Team from "./components/Team.js";
import Calculator from "./Calculator.js";

export default class EloManager {
    constructor() {
        
        // TODO: Import from JSON
        const players = [
            { id: 1, name: "Adam", score: 992 },
            { id: 2, name: "Burns", score: 993 },
            { id: 3, name: "Jon", score: 1144 },
            { id: 4, name: "Matt", score: 968 },
            { id: 5, name: "Durga", score: 1000 },
            { id: 6, name: "Joey", score: 1000 },
            { id: 7, name: "John", score: 937 },
        ];
        
        this._playerList = PlayerList.initialize(players);
        this._team1 = new Team("team1");
        this._team2 = new Team("team2");
        this._playerLocations = new Map();
        this._calculator = new Calculator(this._team1, this._team2);

        wireEvents(this);
    }

    get playerList() { return this._playerList; }
    get team1() { return this._team1; }
    get team2() { return this._team2; }
}

function wireEvents(manager) {
    // Team 1 Player 1
    manager.team1.player1Container.addEventListener("dragover", ev => {
        ev.preventDefault();
    });
    manager.team1.player1Container.addEventListener("drop", ev => {
        handleDropEvent(ev, manager, "team1", "player1");
    });
    // Team 1 Player 2
    manager.team1.player2Container.addEventListener("dragover", ev => {
        ev.preventDefault();
    });
    manager.team1.player2Container.addEventListener("drop", ev => {
        handleDropEvent(ev, manager, "team1", "player2");
    });
    // Team 2 Player 1
    manager.team2.player1Container.addEventListener("dragover", ev => {
        ev.preventDefault();
    });
    manager.team2.player1Container.addEventListener("drop", ev => {
        handleDropEvent(ev, manager, "team2", "player1");
    });
    // Team 2 Player 2
    manager.team2.player2Container.addEventListener("dragover", ev => {
        ev.preventDefault();
    });
    manager.team2.player2Container.addEventListener("drop", ev => {
        handleDropEvent(ev, manager, "team2", "player2");
    });

    // Players
    manager.playerList.players.forEach(player => {
        player.element.addEventListener("dragstart", ev => {
            ev.dataTransfer.setData("text", player.id);
        });
    });

    // Player List
    manager.playerList.element.addEventListener("dragover", ev => {
        ev.preventDefault();
    });
    manager.playerList.element.addEventListener("drop", ev => {
        ev.preventDefault();

        const playerId = parseInt(ev.dataTransfer.getData("text"));
        const matchedPlayer = manager.playerList.find(playerId);
        
        manager.playerList.reclaim(matchedPlayer);

        const prevLocation = manager._playerLocations.get(matchedPlayer);
        if (prevLocation !== undefined) {
            manager[prevLocation.team][prevLocation.player] = undefined;
            manager._playerLocations.delete(matchedPlayer);
        }
    });
}

function handleDropEvent(ev, manager, team, player) {
    ev.preventDefault();

    const playerId = parseInt(ev.dataTransfer.getData("text"));
    const matchedPlayer = manager.playerList.find(playerId);

    if (manager[team][player] !== undefined) {
        manager.playerList.reclaim(manager[team][player]);
        manager._playerLocations.delete(manager[team][player]);
    }
    manager[team][player] = matchedPlayer;
    
    const prevLocation = manager._playerLocations.get(matchedPlayer);
    if (prevLocation !== undefined) {
        manager[prevLocation.team][prevLocation.player] = undefined;
    }
    manager._playerLocations.set(matchedPlayer, { team, player });
}