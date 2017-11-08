import PlayerList from "./components/PlayerList.js";
import Team from "./components/Team.js";
import Calculator from "./Calculator.js";

export default class EloManager {
    constructor() {
        
        // // TODO: Import from JSON
        // const players = [
        //     { id: 1, name: "Adam", score: 992 },
        //     { id: 2, name: "Burns", score: 993 },
        //     { id: 3, name: "Jon", score: 1144 },
        //     { id: 4, name: "Matt", score: 968 },
        //     { id: 5, name: "Durga", score: 1000 },
        //     { id: 6, name: "Joey", score: 1000 },
        //     { id: 7, name: "John", score: 937 },
        // ];
        
        //this._playerList = PlayerList.initialize(players);
        this._playerList = new PlayerList();
        this._team1 = new Team("team1");
        this._team2 = new Team("team2");
        this._playerLocations = new Map();
        this._calculator = new Calculator(this._team1, this._team2);

        wireEvents(this);
    }

    get playerList() { return this._playerList; }
    get team1() { return this._team1; }
    get team2() { return this._team2; }
    get teams() { return [this._team1, this._team2]; }
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

    // Teams
    manager.team1.events.listen("newPlayer", () => checkIfGameCanStart(manager));
    manager.team2.events.listen("newPlayer", () => checkIfGameCanStart(manager));

    // Players
    wireEventsForPlayers(manager.playerList.players);

    // Player List
    manager.playerList.element.addEventListener("dragover", ev => {
        ev.preventDefault();
    });
    manager.playerList.element.addEventListener("drop", ev => {
        ev.preventDefault();

        const playerId = parseInt(ev.dataTransfer.getData("text"));
        const matchedPlayer = manager.playerList.find(playerId);
        
        manager.playerList.reclaim(matchedPlayer);

        const prevLocation = manager._playerLocations.get(matchedPlayer.id);
        if (prevLocation !== undefined) {
            manager[prevLocation.team][prevLocation.player] = undefined;
            manager._playerLocations.delete(matchedPlayer.id);
        }
    });

    // Buttons
    document.getElementById("loadButton").addEventListener("click", ev => {
        document.getElementById("fileInput").click();
    });

    document.getElementById("saveButton").addEventListener("click", ev => {
        savePlayers(manager.playerList);
    });

    document.getElementById("addPlayerButton").addEventListener("click", ev => {
        // TODO: Call the addPlayer() function
    });

    document.getElementById("startButton").addEventListener("click", ev => {
        const cover = document.getElementsByTagName("cover").item(0)
        cover.classList.remove("HIDDEN");

        function recordWin(winningTeam, losingTeam) {
            cover.classList.add("HIDDEN");
            addDrag(manager.playerList.players);
            document.getElementById("team1Container").appendChild(manager.team1.element);
            document.getElementById("team2Container").appendChild(manager.team2.element);
            winningTeam.element.removeEventListener("click", winningTeam.clickHandler);
            losingTeam.element.removeEventListener("click", losingTeam.clickHandler);

            const winningPlayer1OldScore = winningTeam.player1.score;
            const winningPlayer2OldScore = winningTeam.player2.score;
            const losingPlayer1OldScore = losingTeam.player1.score;
            const losingPlayer2OldScore = losingTeam.player2.score;

            winningTeam.player1.score = winningTeam.player1ScoreIfWon;
            winningTeam.player2.score = winningTeam.player2ScoreIfWon;
            losingTeam.player1.score = losingTeam.player1ScoreIfLoss;
            losingTeam.player2.score = losingTeam.player2ScoreIfLoss;

            console.log(winningTeam.player1.name, winningPlayer1OldScore, "=>", winningTeam.player1.score);
            console.log(winningTeam.player2.name, winningPlayer2OldScore, "=>", winningTeam.player2.score);
            console.log(losingTeam.player1.name, losingPlayer1OldScore, "=>", losingTeam.player1.score);
            console.log(losingTeam.player2.name, losingPlayer2OldScore, "=>", losingTeam.player2.score);

            manager.playerList.reclaim(winningTeam.player1);
            manager._playerLocations.delete(winningTeam.player1.id);
            winningTeam.player1 = undefined;
            manager.playerList.reclaim(winningTeam.player2);
            manager._playerLocations.delete(winningTeam.player2.id);
            winningTeam.player2 = undefined;
            manager.playerList.reclaim(losingTeam.player1);
            manager._playerLocations.delete(losingTeam.player1.id);
            losingTeam.player1 = undefined;
            manager.playerList.reclaim(losingTeam.player2);
            manager._playerLocations.delete(losingTeam.player2.id);
            losingTeam.player2 = undefined;
        }

        function prepareTeam(team, otherTeam) {
            cover.appendChild(team.element);
            team.clickHandler = ev => {
                recordWin(team, otherTeam);
            };

            team.element.addEventListener("click", team.clickHandler);
        }

        prepareTeam(manager.team1, manager.team2);
        prepareTeam(manager.team2, manager.team1);
        
        removeDrag(manager.playerList.players);
    });

    const fileInput = document.getElementById("fileInput")
    fileInput.addEventListener("change", ev => {
        const file = ev.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", loadEv => {
                const contents = loadEv.target.result;
                loadPlayers(manager, JSON.parse(contents));
            });
            reader.readAsText(file);
        }
        else {
            alert("Failed to load file");
        }
    });
}

function wireEventsForPlayers(players) {
    addDrag(players);
    players.forEach(player => {
        player.element.addEventListener("dragstart", ev => {
            ev.dataTransfer.setData("text", player.id);
        });
    });
}

function addDrag(players) {
    players.forEach(player => {
        player.element.setAttribute("draggable", "true");
    });
}

function removeDrag(players) {
    players.forEach(player => {
        player.element.setAttribute("draggable", "false");
    });
}

function handleDropEvent(ev, manager, team, player) {
    ev.preventDefault();

    const playerId = parseInt(ev.dataTransfer.getData("text"));
    const matchedPlayer = manager.playerList.find(playerId);

    if (manager[team][player] !== undefined) {
        manager.playerList.reclaim(manager[team][player]);
        manager._playerLocations.delete(manager[team][player].id);
    }
    manager[team][player] = matchedPlayer;
    matchedPlayer.isPlaying = true;
    
    const prevLocation = manager._playerLocations.get(matchedPlayer.id);
    if (prevLocation !== undefined) {
        manager[prevLocation.team][prevLocation.player] = undefined;
    }
    manager._playerLocations.set(matchedPlayer.id, { team, player });
}

function loadPlayers(manager, playerObj) {
    manager.playerList.initialize(playerObj.players);
    wireEventsForPlayers(manager.playerList.players);
}

function savePlayers(playerList) {
    const obj = { players: [] };

    playerList.players.forEach(player => {
        obj.players.push({
            id: player.id,
            name: player.name,
            score: player.score
        });
    });

    download(JSON.stringify(obj), "RookELO.json", "text/plain;charset=utf-8");
}

function addPlayer() {
    // TODO: Code to open a dialog and ask a player's name, then add them to the player list goes here
}

function download(data, filename, type) {
    const file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, filename);
    }
    else {
        const downloadLink = document.createElement("a");

        downloadLink.href = URL.createObjectURL(file);
        downloadLink.download = filename;
        downloadLink.click();
    }
}

function checkIfGameCanStart(manager) {
    const canStart =
        manager.team1.player1 !== undefined && manager.team1.player2 !== undefined &&
        manager.team2.player1 !== undefined && manager.team2.player2 !== undefined;

    document.getElementById("startButton").classList.toggle("HIDDEN", !canStart);
}