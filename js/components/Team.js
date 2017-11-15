import Component from "./Component.js";
import TeamPlayer from "./TeamPlayer.js";
import Events from "../Events.js";

const _privateMembers = new Map();
const _container = Symbol("_container");
const _events = Symbol("_events");
const _player1 = Symbol("_player1");
const _player2 = Symbol("_player2");
const _average = Symbol("_average");
const _transform = Symbol("_transform");
const _expected = Symbol("_expected");
const _ifWon = Symbol("_ifWon");
const _ifLoss = Symbol("_ifLoss");

const _fWireEvents = Symbol("_wireEvents()");
const _fPlayerChangedHandler = Symbol("_playerChangedHandler()");
const _fScoreIfWonUpdatedHandler = Symbol("_scoreIfWonUpdatedHandler()");
const _fScoreIncreaseUpdatedHandler = Symbol("_scoreIncreaseUpdatedHandler()");
const _fScoreIfLossUpdatedHandler = Symbol("_scoreIfLossUpdatedHandler()");
const _fScoreDecreaseUpdatedHandler = Symbol("_scoreDecreaseUpdatedHandler()");

function _(teamComponent, symbol) {
    return _privateMembers.get(teamComponent).get(symbol);
}

export default class TeamComponent extends Component {
    constructor(id) {
        super(`#${id}`);

        _privateMembers.set(this, new Map());

        _privateMembers.get(this).set(_container, new Component(`#${id}Container`));
        _privateMembers.get(this).set(_events, new Events());
        _privateMembers.get(this).set(_player1, new TeamPlayer(this, "player1"));
        _privateMembers.get(this).set(_player2, new TeamPlayer(this, "player2"));
        _privateMembers.get(this).set(_average, NaN);
        _privateMembers.get(this).set(_transform, NaN);
        _privateMembers.get(this).set(_expected, NaN);
        _privateMembers.get(this).set(_ifWon, NaN);
        _privateMembers.get(this).set(_ifLoss, NaN);

        _privateMembers.get(this).set(_fWireEvents, wireEventsFactory(this));
        _privateMembers.get(this).set(_fPlayerChangedHandler, playerChangedFactory(this));
        _privateMembers.get(this).set(_fScoreIfWonUpdatedHandler, scoreIfWonUpdatedHandlerFactory(this));
        _privateMembers.get(this).set(_fScoreIncreaseUpdatedHandler, scoreIncreaseUpdatedHandlerFactory(this));
        _privateMembers.get(this).set(_fScoreIfLossUpdatedHandler, scoreIfLossUpdatedHandlerFactory(this));
        _privateMembers.get(this).set(_fScoreDecreaseUpdatedHandler, scoreDecreaseUpdatedHandlerFactory(this));

        _(this, _fWireEvents)();
    }

    get events() { return _(this, _events); }
    get player1() { return _(this, _player1); }
    get player2() { return _(this, _player2); }
    get players() { return [this.player1, this.player2]; }

    get average() { return _(this, _average); }
    set average(value) {
        _privateMembers.get(this).set(_average, value);
        super.updateText(value, ".average-display");
        super.setVisibility(!isNaN(value), ".average-section");
    }
    
    get transform() { return _(this, _transform); }
    set transform(value) {
        _privateMembers.get(this).set(_transform, value);
    }
    
    get expected() { return _(this, _expected); }
    set expected(value) {
        _privateMembers.get(this).set(_expected, value);
        super.updateText(parseFloat(Math.round(value * 10000) / 100).toFixed(2), ".expected-display");
        super.setVisibility(!isNaN(value), ".expected-section");
    }
    
    get ifWon() { return _(this, _ifWon); }
    set ifWon(value) {
        _privateMembers.get(this).set(_ifWon, value);
    }

    get ifLoss() { return _(this, _ifLoss); }
    set ifLoss(value) {
        _privateMembers.get(this).set(_ifLoss, value);
    }

    removeFromGame() {
        _(this, _container).append(this);
    }
}

function wireEventsFactory(self) {
    return () => {
        self.players.forEach(p => {
            p.events.listen("movePlayer", playerId => {
                self.events.emit("movePlayer", playerId, p);
            });
            p.events.listen("playerChanged", _(self, _fPlayerChangedHandler));
            p.events.listen("scoreIfWonUpdated", _(self, _fScoreIfWonUpdatedHandler));
            p.events.listen("scoreIncreaseUpdated", _(self, _fScoreIncreaseUpdatedHandler));
            p.events.listen("scoreIfLossUpdated", _(self, _fScoreIfLossUpdatedHandler));
            p.events.listen("scoreDecreaseUpdated", _(self, _fScoreDecreaseUpdatedHandler));
        });
    };
}

function playerChangedFactory(self) {
    return () => {
        self.events.emit("playerChanged");
    };
}

function scoreIfWonUpdatedHandlerFactory(self) {
    return (score, playerClass) => {
        self.updateText(score, `.score-increase-section .${playerClass}.new-score-display`);
        self.setVisibility(!isNaN(score), ".score-increase-section");
    };
}

function scoreIncreaseUpdatedHandlerFactory(self) {
    return (increase, playerClass) => {
        self.updateText(increase, `.score-increase-section .${playerClass}.increase-display`);
        self.setVisibility(!isNaN(increase), ".score-increase-section");
    };
}

function scoreIfLossUpdatedHandlerFactory(self) {
    return (score, playerClass) => {
        self.updateText(score, `.score-decrease-section .${playerClass}.new-score-display`);
        self.setVisibility(!isNaN(score), ".score-decrease-section");
    };
}

function scoreDecreaseUpdatedHandlerFactory(self) {
    return (decrease, playerClass) => {
        self.updateText(decrease, `.score-decrease-section .${playerClass}.decrease-display`);
        self.setVisibility(!isNaN(decrease), ".score-decrease-section");
    };
}