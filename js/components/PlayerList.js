import Component from "./Component.js";
import Player from "./Player.js";

export default class PlayerListComponent extends Component {
    constructor() {
        super(document.getElementsByTagName("playerList").item(0));
        this._players = [];
    }

    get players() { return this._players; }
    get nextId() {
        const sortedById = this._players.sort((a, b) => b.id - a.id);
        return sortedById.length > 0 ? sortedById[0].id + 1 : 1;
    }

    addPlayer(playerObj) {
        const playerComponent = new Player(playerObj);
        this._players.push(playerComponent);
        this._element.appendChild(playerComponent._element);
        return playerComponent;
    }

    find(playerId) {
        return this.players.find(player => player.id === playerId);
    }

    reclaim(player) {
        player.isPlaying = false;
        this.sort();
    }

    sort() {
        this.players
            .filter(p => !p.isPlaying)
            .sort((a, b) => b.score - a.score)
            .forEach(p => this._element.appendChild(p.element));
    }

    initialize(playerObjs) {
        playerObjs.forEach(p => {
            this.addPlayer(p);
        });
        this.sort();
    }
}