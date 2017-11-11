import PlayerList from "./components/PlayerList.js";
import Team from "./components/Team.js";
import Calculator from "./Calculator.js";
import GoogleSession from "./OAuth.js";
import NewPlayerModal from "./components/modal/NewPlayerModal.js";
import LoadModal from "./components/modal/LoadModal.js";

export default class EloManager {
    constructor() {
        this._playerList = new PlayerList();
        this._team1 = new Team("team1");
        this._team2 = new Team("team2");
        this._playerLocations = new Map();
        this._calculator = new Calculator(this._team1, this._team2);
        this._newPlayerModal = new NewPlayerModal();
        this._loadModal = new LoadModal();
        this._googleSession = new GoogleSession();
        this._savedState = false;

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

    // Add Player
    manager._newPlayerModal.events.listen("ok", () => {
        const newPlayerObj = {
            name: manager._newPlayerModal.playerName,
            score: 1000
        };

        const newPlayer = manager.playerList.addPlayer(newPlayerObj);
        wireEventsForPlayers([newPlayer]);
    });

    // Load
    manager._loadModal.events.listen("google", () => {
        manager._googleSession.signIn();
    });
    manager._loadModal.events.listen("upload", () => {
        document.getElementById("fileInput").click();
    });

    // Google Session
    manager._googleSession.events.listen("signedIn", state => {
        //console.log("File", state);
        loadPlayers(manager, state);
        manager._loadModal.hide();
    });

    // Window close
    window.addEventListener("beforeunload", ev => {
        manager._googleSession.signOut();
    });

    // Buttons
    const loadButton = document.getElementById("loadButton");
    loadButton.addEventListener("click", ev => {
        manager._loadModal.show();
    });
    loadButton.addEventListener("dragover", ev => ev.preventDefault());
    loadButton.addEventListener("drop", ev => {
        ev.preventDefault();
        let file;
        if (ev.dataTransfer.items) {
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                if (ev.dataTransfer.items[i].kind === "file") {
                    file = ev.dataTransfer.items[i].getAsFile();
                }
            }
        }
        else {
            file = ev.dataTransfer.files[0];
        }
        loadFile(file, manager);
    });

    document.getElementById("saveButton").addEventListener("click", ev => {
        savePlayers(manager);
    });

    document.getElementById("addPlayerButton").addEventListener("click", ev => {
        manager._newPlayerModal.show();
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

    const fileInput = document.getElementById("fileInput");
    fileInput.addEventListener("change", ev => {
        if (fileInput.value === "") return;

        const file = ev.target.files[0];

        fileInput.value = "";
        loadFile(file, manager);
    });
}

function loadFile(file, manager) {
    if (file) {
        const reader = new FileReader();
        reader.addEventListener("load", ev => {
            const contents = ev.target.result;
            loadPlayers(manager, JSON.parse(contents));
        });
        reader.readAsText(file);
    }
    else {
        alert("Failed to load file");
    }
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
    manager._playerLocations.clear();
    manager.playerList.clear();
    manager.team1.player1 = undefined;
    manager.team1.player2 = undefined;
    manager.team2.player1 = undefined;
    manager.team2.player2 = undefined;
    manager.playerList.initialize(playerObj.players);
    wireEventsForPlayers(manager.playerList.players);
}

function savePlayers(manager) {
    const obj = { players: [] };

    manager.playerList.players.forEach(player => {
        obj.players.push({
            name: player.name,
            score: player.score
        });
    });

    if (!manager._googleSession.sessionActive) {
        download(JSON.stringify(obj), "RookELO.json", "text/plain;charset=utf-8");
    }
    else {
        manager._googleSession.saveState(obj);
    }
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