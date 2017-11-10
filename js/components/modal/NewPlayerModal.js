import ModalComponent from "./Modal.js";

export default class NewPlayerModalComponent extends ModalComponent {
    constructor() {
        super();
        super.html = "Enter the new player's name:<br /><br /><input type='text' class='playerName' />";
        
        const okButton = super.addButton("okButton", "Add Player", "ok", true);
        getPlayerNameInput(this).addEventListener("keypress", ev => {
            if (ev.keyCode === 13) {
                okButton.click();
            }
        });
    }

    get playerName() { return getPlayerNameInput(this).value; }
    set playerName(value) { getPlayerNameInput(this).value = value; }

    show() {
        this.playerName = "";
        super.show();
        getPlayerNameInput(this).focus();
    }
}

function getPlayerNameInput(modal) {
    return modal.element.getElementsByClassName("playerName").item(0);
}

function getAddPlayerButton(modal) {
    return modal.element.getElementsByClassName("okButton").item(0);
}