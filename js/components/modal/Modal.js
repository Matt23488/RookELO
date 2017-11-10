import Component from "../Component.js";
import Events from "../../Events.js";
import { importTemplate } from "../../utilities.js";

export default class ModalComponent extends Component {
    constructor() {
        super(importTemplate("modalTemplate"));

        getCloseButton(this).addEventListener("click", ev => {
            this.hide();
        });

        this._events = new Events();
        this._buttons = new Map();
    }

    get text() { return this._text; }
    set text(value) {
        this._text = value;
        getContentElement(this).innerText = value;
    }

    get html() { return this._text; }
    set html(value) {
        this._text = value;
        getContentElement(this).innerHTML = value;
    }

    get events() { return this._events; }

    addButton(id, text, event, hideModal) {
        const button = document.createElement("button");
        button.id = id;
        button.innerText = text;
        button.addEventListener("click", ev => {
            this._events.emit(event);
            if (hideModal) {
                this.hide();
            }
        });
        getFooterElement(this).appendChild(button);
        this._buttons.set(id, button);

        return button;
    }

    removeButton(id) {
        this._buttons.delete(id);
        getFooterElement(this).getElementById(id).remove();
    }

    getButton(id) {
        return this._buttons.get(id);
    }

    show() {
        document.body.appendChild(this.element);
    }

    hide() {
        if (this.element.parentElement) {
            document.body.removeChild(this.element);
        }
    }
}

function getContentElement(modal) {
    return modal.element.getElementsByTagName("modalContent").item(0);
}

function getCloseButton(modal) {
    return modal.element.getElementsByClassName("close").item(0);
}

function getFooterElement(modal) {
    return modal.element.getElementsByTagName("modalFooter").item(0);
}