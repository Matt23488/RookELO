import Component from "./Component.js";
import { importTemplate, privateAccessorFactory } from "../utilities.js";

const _ = privateAccessorFactory();

const _id = Symbol("_id");
const _name = Symbol("_name");
const _score = Symbol("_score");

const _fWireEvents = Symbol("_wireEvents()");
const _fSetDraggable = Symbol("setDraggable()");

export default class PlayerComponent extends Component {
    constructor(playerObj) {
        super(importTemplate("playerTemplate"));
        
        _.initialize(this);

        _(this).set(_id, playerObj.id);

        _(this).set(_fWireEvents, wireEventsFactory(this));
        _(this).set(_fSetDraggable, setDraggableFactory(this));

        this.name = playerObj.name;
        this.score = playerObj.score;

        _(this, _fWireEvents)();
    }

    get id() { return _(this, _id); }

    get name() { return _(this, _name); }
    set name(value) {
        _(this).set(_name, value);
        super.updateText(value, ".name");
    }

    get score() { return _(this, _score); }
    set score(value) {
        _(this).set(_score, value);
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