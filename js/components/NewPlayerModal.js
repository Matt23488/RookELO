import ModalComponent from "./Modal.js";
import Events from "../Events.js";

export default class NewPlayerModalComponent extends ModalComponent {
    constructor() {
        super();
        this._events = new Events();
        super.html = "Enter the new player's name:<br /><br /><input type='text' class='playerName' />";
        super.footerHtml = "<button class='okButton'>Add Player</button>";

        getPlayerNameInput(this).addEventListener("keypress", ev => {
            if (ev.keyCode === 13) {
                submit(this);
            }
        });

        getAddPlayerButton(this).addEventListener("click", ev => {
            submit(this);
        });
    }

    get events() { return this._events; }

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

function submit(modal) {
    modal.hide();
    modal.events.emit("ok");
}