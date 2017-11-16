import Component from "../Component.js";
import ModalComponent from "./Modal.js";

export default class NewPlayerModalComponent extends ModalComponent {
    constructor() {
        super();
        super.html = "Enter the new player's name:<br /><br /><input type='text' class='playerName' />";
        
        const okButton = super.addButton("okButton", "Add Player", "ok", true);
        super.listen("keypress", ev => {
            if (ev.keyCode === 13) {
                okButton.click();
            }
        }, ".playerName");
    }

    get playerName() { return super.getValue(".playerName"); }
    set playerName(value) { super.setValue(value, ".playerName"); }

    show() {
        this.playerName = "";
        super.show();
        super.focus(".playerName");
    }
}