import Component from "./Component.js";
import Player from "./Player.js";

export default class PlayerListComponent extends Component {
    constructor() {
        super(document.getElementsByTagName("playerList").item(0));
        this._players = [];
    }

    get players() { return this._players; }

    addPlayer(player) {
        const playerComponent = new Player(player);
        this._players.push(playerComponent);
        this._element.appendChild(playerComponent._element);
    }

    find(playerId) {
        return this.players.find(player => player.id === playerId);
    }

    reclaim(player) {
        player.isPlaying = false;
        this.sort();
    }

    sort() {
        this.players.filter(p => !p.isPlaying).sort((a, b) => b.score - a.score).forEach(p => this._element.appendChild(p.element));
    }

    initialize(players) {
        players.forEach(p => {
            this.addPlayer(p);
        });
        this.sort();
    }
}