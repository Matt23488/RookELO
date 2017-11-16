import Component from "./Component.js";
import Player from "./Player.js";
import Events from "../Events.js";

let self;
let calledViaGetInstance = false;

let _events;
let _players;

export default class PlayerListComponent extends Component {
    constructor() {
        if (!calledViaGetInstance) throw new Error("You must use the static getInstance() method to get a reference to this class.");

        super(document.getElementsByTagName("playerList").item(0));

        _events = new Events();
        _players = new Set();

        wireEvents(this);
    }

    static getInstance() {
        calledViaGetInstance = true;
        if (!self) self = new PlayerListComponent();
        calledViaGetInstance = false;
        return self;
    }

    get events() { return _events; }

    addPlayer(player) {
        this.append(player);
        _players.add(player);
        sort();
    }
    
    removePlayer(player) {
        _players.delete(player);
        this.remove(player);
    }

    clear() {
        _players.clear();
    }
}

function wireEvents(self) {
    self.listen("dragover", ev => ev.preventDefault());
    self.listen("drop", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        self.events.emit("movePlayer", parseInt(ev.dataTransfer.getData("text")), self);
    });
}

function sort() {
    [..._players]
        .sort((a, b) => b.score - a.score)
        .forEach(p => self.append(p));
}