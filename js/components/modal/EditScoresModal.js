import Component from "../Component.js";
import ModalComponent from "./Modal.js";

let self;
let calledViaGetInstance = false;

let _playerManager;
let _rowIds;

export default class EditScoresModalComponent extends ModalComponent {
    constructor(playerManager) {
        super();

        if (!calledViaGetInstance) throw new Error("You must use the static getInstance() method to get a reference to this class.");

        _playerManager = playerManager;
        _rowIds = [];

        super.addButton("okButton", "Save Scores", "save", true);
        super.addButton("cancelButton", "Cancel", "cancel", true);
    }

    static getInstance(playerManager) {
        calledViaGetInstance = true;
        if (!self) self = new EditScoresModalComponent(playerManager);
        calledViaGetInstance = false;

        return self;
    }

    get scores() {
        const scoreArr = [];

        _rowIds.forEach(id => {
            scoreArr.push({
                id,
                score: parseInt(self.getValue(`#player${id}`))
            });
        });

        return scoreArr;
    }

    show() {
        const currentPlayers = [..._playerManager.players].sort((a, b) => b.score - a.score);

        _rowIds = [];
        let html = "<table><tbody>";
        for (let i = 0; i < currentPlayers.length; i++) {
            const player = currentPlayers[i];
            html += "<tr>";
            html += `<td>${player.name}</td>`;
            html += `<td><input id="player${player.id}" type="text" value="${player.score}" /></td>`;
            html += "</tr>";
            _rowIds.push(player.id);
        }
        html += "</tbody></table>";
        super.html = html;
        super.show();
    }
}