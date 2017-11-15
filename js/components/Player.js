import Component from "./Component.js";
import { importTemplate } from "../utilities.js";

const _privateMembers = new Map();

const _id = Symbol("_id");
const _name = Symbol("_name");
const _score = Symbol("_score");

const _fWireEvents = Symbol("_wireEvents()");
const _fSetDraggable = Symbol("setDraggable()");

function _(self, symbol) {
    return _privateMembers.get(self).get(symbol);
}

export default class PlayerComponent extends Component {
    constructor(playerObj) {
        super(importTemplate("playerTemplate"));
        _privateMembers.set(this, new Map());

        _privateMembers.get(this).set(_id, playerObj.id);

        _privateMembers.get(this).set(_fWireEvents, wireEventsFactory(this));
        _privateMembers.get(this).set(_fSetDraggable, setDraggableFactory(this));

        this.name = playerObj.name;
        this.score = playerObj.score;

        _(this, _fWireEvents)();
    }

    get id() { return _(this, _id); }

    get name() { return _(this, _name); }
    set name(value) {
        _privateMembers.get(this).set(_name, value);
        super.updateText(value, ".name");
    }

    get score() { return _(this, _score); }
    set score(value) {
        _privateMembers.get(this).set(_score, value);
        super.updateText(value, ".score");
    }

    set draggable(shouldBeDraggable) {
        _(this, _fSetDraggable)(shouldBeDraggable);
    }
}

function wireEventsFactory(self) {
    return () => {
        _(self, _fSetDraggable)(true);
        self.listen("dragstart", ev => {
            ev.dataTransfer.setData("text", self.id);
        });
    };
}

function setDraggableFactory(self) {
    return shouldBeDraggable => {
        self.setAttribute("draggable", shouldBeDraggable);
    };
}