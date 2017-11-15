import Component from "./Component.js";
import Events from "../Events.js";

const _privateMembers = new Map();
const _events = Symbol("_events");
const _team = Symbol("_team");
const _playerClass = Symbol("_playerClass");
const _player = Symbol("_player");
const _scoreIfWon = Symbol("_scoreIfWon");
const _scoreIncrease = Symbol("_scoreIncrease");
const _scoreIfLoss = Symbol("_scoreIfLoss");
const _scoreDecrease = Symbol("_scoreDecrease");

const _fWireEvents = Symbol("_wireEvents()");
const _fPlayerChangedEmitter = Symbol("_playerChangedEmitter()");

function _(teamPlayerComponent, symbol) {
    return _privateMembers.get(teamPlayerComponent).get(symbol);
}

export default class TeamPlayerComponent extends Component {
    constructor(team, playerClass) {
        super(`.${playerClass}.player-container`, team);

        _privateMembers.set(this, new Map());

        _privateMembers.get(this).set(_events, new Events());
        _privateMembers.get(this).set(_team, team);
        _privateMembers.get(this).set(_playerClass, playerClass);
        _privateMembers.get(this).set(_player, undefined);
        _privateMembers.get(this).set(_scoreIfWon, NaN);
        _privateMembers.get(this).set(_scoreIncrease, NaN);
        _privateMembers.get(this).set(_scoreIfLoss, NaN);
        _privateMembers.get(this).set(_scoreDecrease, NaN);

        _privateMembers.get(this).set(_fWireEvents, wireEventsFactory(this));
        _privateMembers.get(this).set(_fPlayerChangedEmitter, playerChangedEmitterFactory(this));

        _(this, _fWireEvents)();
    }

    get events() { return _(this, _events); }
    get player() { return _(this, _player); }

    get name() { return this.player.name; }

    get score() { return this.player.score; }
    set score(value) { this.player.score = value; }

    get scoreIfWon() { return _(this, _scoreIfWon); }
    set scoreIfWon(value) {
        _privateMembers.get(this).set(_scoreIfWon, value);
        this.events.emit("scoreIfWonUpdated", value, _(this, _playerClass));
    }

    get scoreIncrease() { return _(this, _scoreIncrease); }
    set scoreIncrease(value) {
        _privateMembers.get(this).set(_scoreIncrease, value);
        this.events.emit("scoreIncreaseUpdated", value, _(this, _playerClass));
    }

    get scoreIfLoss() { return _(this, _scoreIfLoss); }
    set scoreIfLoss(value) {
        _privateMembers.get(this).set(_scoreIfLoss, value);
        this.events.emit("scoreIfLossUpdated", value, _(this, _playerClass));
    }

    get scoreDecrease() { return _(this, _scoreDecrease); }
    set scoreDecrease(value) {
        _privateMembers.get(this).set(_scoreDecrease, value);
        this.events.emit("scoreDecreaseUpdated", value, _(this, _playerClass));
    }

    addPlayer(player) {
        _privateMembers.get(this).set(_player, player);
        this.append(player);
        _(this, _fPlayerChangedEmitter)();
    }

    removePlayer() {
        this.remove(_(this, _player));
        _privateMembers.get(this).set(_player, undefined);
        _(this, _fPlayerChangedEmitter)();
    }

    hasPlayer() {
        return this.player !== undefined;
    }
}

function wireEventsFactory(self) {
    return () => {
        self.listen("dragover", ev => ev.preventDefault());
        self.listen("drop", ev => {
            self.events.emit("movePlayer", parseInt(ev.dataTransfer.getData("text")), self);
        });
    };
}

function playerChangedEmitterFactory(teamPlayerComponent) {
    return () => {
        teamPlayerComponent.events.emit("playerChanged");
    };
}