import Component from "./Component.js";
import { importTemplate } from "../utilities.js";

export default class PlayerComponent extends Component {
    constructor(player) {
        super(importTemplate("playerTemplate"));
        this._id = player.id;
        this.name = player.name;
        this.score = player.score;

        this.element.addEventListener("dragstart", ev => {
            ev.dataTransfer.setData("text", this.id);
        });
    }

    get id() { return this._id; };

    get name() { return this._name; }
    set name(name) {
        this._name = name;
        this._element.getElementsByClassName("name").item(0).innerText = name;
    }

    get score() { return parseInt(this._score); }
    set score(score) {
        this._score = score;
        this._element.getElementsByClassName("score").item(0).innerText = score;
    }
}