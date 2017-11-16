import Component from "./Component.js";
import Events from "../Events.js";
import { privateAccessorFactory } from "../utilities.js";

const _ = privateAccessorFactory();

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

export default class TeamPlayerComponent extends Component {
    constructor(team, playerClass) {
        super(`.${playerClass}.player-container`, team);

        _.initialize(this);

        _(this).set(_events, new Events());
        _(this).set(_team, team);
        _(this).set(_playerClass, playerClass);
        _(this).set(_player, undefined);
        _(this).set(_scoreIfWon, NaN);
        _(this).set(_scoreIncrease, NaN);
        _(this).set(_scoreIfLoss, NaN);
        _(this).set(_scoreDecrease, NaN);

        _(this).set(_fWireEvents, wireEventsFactory(this));
        _(this).set(_fPlayerChangedEmitter, playerChangedEmitterFactory(this));

        _(this, _fWireEvents)();
    }

    get events() { return _(this, _events); }
    get player() { return _(this, _player); }

    get name() { return this.player.name; }

    get score() { return this.player.score; }
    set score(value) { this.player.score = value; }

    get scoreIfWon() { return _(this, _scoreIfWon); }
    set scoreIfWon(value) {
        _(this).set(_scoreIfWon, value);
        this.events.emit("scoreIfWonUpdated", value, _(this, _playerClass));
    }

    get scoreIncrease() { return _(this, _scoreIncrease); }
    set scoreIncrease(value) {
        _(this).set(_scoreIncrease, value);
        this.events.emit("scoreIncreaseUpdated", value, _(this, _playerClass));
    }

    get scoreIfLoss() { return _(this, _scoreIfLoss); }
    set scoreIfLoss(value) {
        _(this).set(_scoreIfLoss, value);
        this.events.emit("scoreIfLossUpdated", value, _(this, _playerClass));
    }

    get scoreDecrease() { return _(this, _scoreDecrease); }
    set scoreDecrease(value) {
        _(this).set(_scoreDecrease, value);
        this.events.emit("scoreDecreaseUpdated", value, _(this, _playerClass));
    }

    addPlayer(player) {
        _(this).set(_player, player);
        this.append(player);
        _(this, _fPlayerChangedEmitter)();
    }

    removePlayer() {
        this.remove(_(this, _player));
        _(this).set(_player, undefined);
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
            ev.preventDefault();
            ev.stopPropagation();
            self.events.emit("movePlayer", parseInt(ev.dataTransfer.getData("text")), self);
        });
    };
}

function playerChangedEmitterFactory(teamPlayerComponent) {
    return () => {
        teamPlayerComponent.events.emit("playerChanged");
    };
}