import Component from "../Component.js";
import Button from "../Button.js";
import Events from "../../Events.js";
import { importTemplate, privateAccessorFactory } from "../../utilities.js";

const _ = privateAccessorFactory();

const _events = Symbol("_events");
const _closeButton = Symbol("_closeButton");
const _buttons = Symbol("_buttons");
const _content = Symbol("_content");
const _shown = Symbol("_shown");

const _body = new Component(document.body);

export default class ModalComponent extends Component {
    constructor() {
        super(importTemplate("modalTemplate"));

        _(this).set(_events, new Events());
        _(this).set(_closeButton, new Component(".close", this));
        _(this).set(_buttons, new Map());
        _(this).set(_content, "");
        _(this).set(_shown, false);

        _(this, _closeButton).listen("click", ev => this.hide());
    }

    get text() { return _(this, _content); }
    set text(value) {
        _(this).set(_content, value);
        super.updateText(value, "modalContent");
    }

    get html() { return _(this, _content); }
    set html(value) {
        _(this).set(_content, value);
        super.updateHtml(value, "modalContent");
    }

    get events() { return _(this, _events); }

    addButton(id, text, event, hideModal) {
        const button = new Button(importTemplate("buttonTemplate"));
        button.setAttribute("id", id);
        button.updateText(text);
        button.onClick(ev => {
            this.events.emit(event);
            if (hideModal) {
                this.hide();
            }
        });
        super.append(button, "modalFooter");
        _(this, _buttons).set(id, button);

        return button;
    }

    removeButton(id) {
        this.getButton(id).remove();
        _(this, _buttons).delete(id);
    }

    getButton(id) {
        return _(this, _buttons).get(id);
    }

    show() {
        _body.append(this);
        _(this).set(_shown, true);
    }

    hide() {
        if (_(this, _shown)) {
            _body.remove(this);
            _(this).set(_shown, false);
        }
    }
}