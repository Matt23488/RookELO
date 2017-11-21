import Component from "./components/Component.js";
import PlayerList from "./components/PlayerList.js";
import Team from "./components/Team.js";
import NewPlayerModal from "./components/modal/NewPlayerModal.js";
import LoadModal from "./components/modal/LoadModal.js";
import Button from "./components/Button.js";
import ToastManager, { ToastType } from "./components/Toast.js";
import Calculator from "./Calculator.js";
import GoogleSession from "./OAuth.js";
import PlayerManager from "./PlayerManager.js";
import { preventDefault, getFileFromEvent, max, min } from "./utilities.js";

let self;
let calledViaStart = false;

let _team1;
let _team2;
let _playerManager;
let _newPlayerModal;
let _loadModal;
let _loadButton;
let _signOutButton;
let _saveButton;
let _addPlayerButton;
let _startButton;
let _cover;
let _fileInput;
let _toast;
let _calculator;
let _googleSession;
let _savedState;
let _records;

export default class EloManager {
    constructor() {
        if (!calledViaStart) throw new Error("Please use the static start() method!");

        _team1 = new Team("team1");
        _team2 = new Team("team2");
        _playerManager = PlayerManager.getInstance(_team1, _team2);
        _newPlayerModal = new NewPlayerModal();
        _loadModal = new LoadModal();
        _loadButton = new Button("#loadButton");
        _signOutButton = new Button("#signOutButton");
        _saveButton = new Button("#saveButton");
        _addPlayerButton = new Button("#addPlayerButton");
        _startButton = new Button("#startButton");
        _cover = new Component("#activeGameCover");
        _fileInput = new Component("#fileInput");
        _toast = ToastManager.getInstance();
        _calculator = Calculator.getInstance(_team1, _team2);
        _googleSession = GoogleSession.getInstance();
        _savedState = false;
        _records = {
            highScore: { name: "", score: 1000 },
            lowScore: { name: "", score: 1000 }
        };

        wireEvents(this);
    }

    get team1() { return _team1; }
    get team2() { return _team2; }
    get teams() { return [_team1, _team2]; }

    static start() {
        calledViaStart = true;
        if (!self) self = new EloManager();
        calledViaStart = false;
    }
}

function wireEvents(self) {
    self.teams.forEach(t => t.events.listen("playerChanged", () => checkIfGameCanStart()));

    // Add Player
    _newPlayerModal.events.listen("ok", () => {
        const newPlayerObj = {
            name: _newPlayerModal.playerName,
            score: 1000
        };

        _playerManager.addPlayer(newPlayerObj);
        _toast.displayMessage(`Player "${newPlayerObj.name}" added successfully!`, ToastType.success);
    });

    // Load
    _loadModal.events.listen("google", () => {
        _googleSession.signIn();
    });
    _loadModal.events.listen("upload", () => {
        // Still need to replace this with a Component.
        // Unfortunately, the commented line doesn't appear to work.
        // The only thing I can find is that it may be a security feature?
        document.getElementById("fileInput").click();
        // _fileInput.emit("click");
    });

    // Google Session
    _googleSession.events.listen("signedIn", state => {
        loadState(state);
        _loadModal.hide();
        _loadButton.setVisibility(false);
        _signOutButton.setVisibility(true);
        _toast.displayMessage(`Logged in successfully!`, ToastType.success);
    });

    // Window close
    window.addEventListener("beforeunload", ev => {
        _googleSession.signOut();
    });

    // Cancel game
    _cover.listen("click", ev => endGame());

    // Buttons
    _loadButton.onClick(ev => _loadModal.show());
    _loadButton.listen("dragover", preventDefault);
    _loadButton.listen("drop", ev => {
        preventDefault(ev);
        ev.stopPropagation();
        const file = getFileFromEvent(ev);
        loadFile(file);
    });
    _signOutButton.onClick(ev => {
        _googleSession.signOut();
        _playerManager.clear();
        _signOutButton.setVisibility(false);
        _startButton.setVisibility(false);
        _loadButton.setVisibility(true);
        _toast.displayMessage(`Sign out successful.`);
    });
    _saveButton.onClick(ev => saveState());
    _addPlayerButton.onClick(ev => _newPlayerModal.show());

    _startButton.onClick(ev => {
        _cover.setVisibility(true);

        function recordWin(winningTeam, losingTeam) {
            endGame();

            const winningPlayer1OldScore = winningTeam.player1.score;
            const winningPlayer2OldScore = winningTeam.player2.score;
            const losingPlayer1OldScore = losingTeam.player1.score;
            const losingPlayer2OldScore = losingTeam.player2.score;

            winningTeam.player1.score = winningTeam.player1.scoreIfWon;
            winningTeam.player2.score = winningTeam.player2.scoreIfWon;
            losingTeam.player1.score = losingTeam.player1.scoreIfLoss;
            losingTeam.player2.score = losingTeam.player2.scoreIfLoss;

            let toastHtml = "";
            toastHtml += `${winningTeam.player1.name}: ${winningPlayer1OldScore} => ${winningTeam.player1.score}<br />`;
            toastHtml += `${winningTeam.player2.name}: ${winningPlayer2OldScore} => ${winningTeam.player2.score}<br />`;
            toastHtml += `${losingTeam.player1.name}: ${losingPlayer1OldScore} => ${losingTeam.player1.score}<br />`;
            toastHtml += `${losingTeam.player2.name}: ${losingPlayer2OldScore} => ${losingTeam.player2.score}`;
            _toast.displayMessage(toastHtml);

            // Update records
            const highScorerForGame = max(winningTeam.player1, winningTeam.player2, p => p.score);
            const lowScorerForGame = min(losingTeam.player1, losingTeam.player2, p => p.score);
            if (highScorerForGame.score > _records.highScore.score) {
                _records.highScore.name = highScorerForGame.name;
                _records.highScore.score = highScorerForGame.score;
            }
            if (lowScorerForGame.score < _records.lowScore.score) {
                _records.lowScore.name = lowScorerForGame.name;
                _records.lowScore.score = lowScorerForGame.score;
            }

            _playerManager.inactivatePlayers();
        }

        function prepareTeam(team, otherTeam) {
            _cover.append(team);
            team.clickHandler = ev => {
                ev.stopPropagation();
                
                recordWin(team, otherTeam);
            };

            team.listen("click", team.clickHandler);
        }

        prepareTeam(_team1, _team2);
        prepareTeam(_team2, _team1);
        
        _playerManager.makePlayersDraggable(false);
    });

    _fileInput.listen("change", ev => {
        if (_fileInput.getValue() === "") return;

        const file = ev.target.files[0];
        _fileInput.setValue("");
        _startButton.setVisibility(false);
        loadFile(file);
    });
}

function endGame() {
    _cover.setVisibility(false);
    _playerManager.makePlayersDraggable(true);
    self.teams.forEach(t => {
        t.removeFromGame();
        t.unListen("click", t.clickHandler);
    });
}

function loadFile(file) {
    if (file) {
        const reader = new FileReader();
        reader.addEventListener("load", ev => {
            const contents = ev.target.result;
            try {
                loadState(JSON.parse(contents));
            }
            catch (error) {
                _toast.displayMessage("Failed to load file!", ToastType.error);
            }
        });
        reader.readAsText(file);
    }
    else {
        _toast.displayMessage("Failed to load file!", ToastType.error);
    }
}

function loadState(stateObj) {
    _startButton.setVisibility(false);
    loadPlayers(stateObj.players);
    loadRecords(stateObj.records);
    _toast.displayMessage("Loaded ELO state successfully!");
}

function loadPlayers(playersArr) {
    _playerManager.clear();
    _playerManager.initialize(playersArr);
    _toast.displayMessage("Loaded players successfully!", ToastType.success);
}

function loadRecords(recordsObj) {
    if (recordsObj) {
        _records.highScore = recordsObj.highScore;
        _records.lowScore = recordsObj.lowScore;
    }

    // Make sure the records are updated, since this is a new feature
    _playerManager.players.forEach(p => {
        if (p.score > _records.highScore.score) {
            _records.highScore.name = p.name;
            _records.highScore.score = p.score;
        }
        else if (p.score < _records.lowScore.score) {
            _records.lowScore.name = p.name;
            _records.lowScore.score = p.score;
        }
    });

    _toast.displayMessage("Loaded records successfully!", ToastType.success);
}

function saveState() {
    const obj = {
        players: [],
        records: _records
    };

    _playerManager.players.forEach(p => {
        obj.players.push({
            name: p.name,
            score: p.score
        });
    });

    if (!_googleSession.sessionActive) {
        download(JSON.stringify(obj), "RookELO.json", "text/plain;charset=utf-8");
    }
    else {
        _googleSession.saveState(obj);
        _toast.displayMessage("ELO state saved successfully!", ToastType.success);
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

function checkIfGameCanStart() {
    _startButton.setVisibility(_playerManager.teamsAreFull());
}