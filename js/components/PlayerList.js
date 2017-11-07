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

    reclaim(playerId) {
        const player = this.find(playerId);
        this._element.appendChild(player.element);
    }

    static initialize(players) {
        const playerList = new PlayerListComponent();
        players.forEach(p => {
            playerList.addPlayer(p);
        });
        return playerList;
    }
}