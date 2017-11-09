import Component from "./Component.js";
import { importTemplate } from "../utilities.js";

export default class PlayerComponent extends Component {
    constructor(playerObj) {
        super(importTemplate("playerTemplate"));
        this._id = playerObj.id;
        this.name = playerObj.name;
        this.score = playerObj.score;
        this._isPlaying = false;
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

    get isPlaying() { return this._isPlaying; }
    set isPlaying(value) { this._isPlaying = value; }
}