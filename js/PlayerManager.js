import Player from "./components/Player.js"
import PlayerList from "./components/PlayerList.js"

let self;
let calledViaGetInstance = false;

let _playerLocations;
let _players;
let _playerList;
let _teams;

export default class PlayerManager {
    constructor(teams) {
        if (!calledViaGetInstance) throw new Error("You must use the static getInstance() method to get a reference to this class.");

        _playerLocations = new Map();
        _players = new Set();
        _playerList = PlayerList.getInstance();
        _teams = teams;

        wireEvents(this);
    }

    static getInstance(...teams) {
        calledViaGetInstance = true;
        if (!self) self = new PlayerManager(teams);
        calledViaGetInstance = false;

        return self;
    }

    get players() { return _players; }

    addPlayer(playerObj) {
        playerObj.id = getNextId();
        const playerComponent = new Player(playerObj);
        _players.add(playerComponent);
        _playerList.addPlayer(playerComponent);
        _playerLocations.set(playerComponent.id, _playerList);
        return playerComponent;
    }

    movePlayer(player, destination) {
        _playerLocations.get(player.id).removePlayer(player);

        if (destination !== _playerList && destination.player) {
            self.movePlayer(destination.player, _playerList);
        }

        _playerLocations.set(player.id, destination);
        destination.addPlayer(player);
    }

    initialize(playerObjs) {
        playerObjs.forEach(p => {
            this.addPlayer(p);
        });
    }

    clear() {
        _players.forEach(p => {
            _playerLocations.get(p.id).removePlayer(p);
            p.remove();
        });
        _players.clear();
        _playerLocations.clear();
        _playerList.clear();
    }

    makePlayersDraggable(shouldBeDraggable) {
        _players.forEach(p => p.draggable = shouldBeDraggable);
    }

    inactivatePlayers() {
        _players.forEach(p => this.movePlayer(p, _playerList));
    }

    teamsAreFull() {
        let activePlayerCount = 0;
        _players.forEach(p => {
            if (_playerLocations.get(p.id) !== _playerList) activePlayerCount++;
        });

        return activePlayerCount === 4;
    }
}

function getNextId() {
    const playersSortedById = [..._players].sort((a, b) => b.id - a.id);
    return playersSortedById.length > 0 ? playersSortedById[0].id + 1 : 1;
}

function wireEvents(self) {
    function _handleMovePlayer(playerId, destination) {
        const matchedPlayer = findInSet(_players, p => p.id === playerId)[0];
        self.movePlayer(matchedPlayer, destination);
    }

    _playerList.events.listen("movePlayer", _handleMovePlayer);
    _teams.forEach(t => t.events.listen("movePlayer", _handleMovePlayer));
}

function findInSet(set, predicate) {
    return [...set].filter(predicate);
}