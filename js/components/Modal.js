import Component from "./Component.js";
import { importTemplate } from "../utilities.js";

export default class ModalComponent extends Component {
    constructor() {
        super(importTemplate("modalTemplate"));
        this.text = "This is some test text. I guess it should say something like 'lorem ipsum dolor sit amet' or some shit";

        getCloseButton(this).addEventListener("click", ev => {
            this.hide();
        });
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

    get footerHtml() { return this._footerHtml; }
    set footerHtml(value) {
        this._footerHtml = value;
        getFooterElement(this).innerHTML = value;
    }

    show() {
        document.body.appendChild(this.element);
    }

    hide() {
        document.body.removeChild(this.element);
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