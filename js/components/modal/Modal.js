import Component from "../Component.js";
import Button from "../Button.js";
import Events from "../../Events.js";
import { importTemplate } from "../../utilities.js";

const _privateMembers = new Map();

const _events = Symbol("_events");
const _closeButton = Symbol("_closeButton");
const _buttons = Symbol("_buttons");
const _content = Symbol("_content");
const _shown = Symbol("_shown");

const _body = new Component(document.body);

function _(self, symbol) {
    return _privateMembers.get(self).get(symbol);
}

export default class ModalComponent extends Component {
    constructor() {
        super(importTemplate("modalTemplate"));

        _privateMembers.set(this, new Map());

        _privateMembers.get(this).set(_events, new Events());
        _privateMembers.get(this).set(_closeButton, new Component(".close", this));
        _privateMembers.get(this).set(_buttons, new Map());
        _privateMembers.get(this).set(_content, "");
        _privateMembers.get(this).set(_shown, false);

        _(this, _closeButton).listen("click", ev => this.hide());
    }

    get text() { return _(this, _content); }
    set text(value) {
        _privateMembers.get(this).set(_content, value);
        super.updateText(value, "modalContent");
    }

    get html() { return _(this, _content); }
    set html(value) {
        _privateMembers.get(this).set(_content, value);
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
        _privateMembers.get(this).set(_shown, true);
    }

    hide() {
        if (_(this, _shown)) {
            _body.remove(this);
            _privateMembers.get(this).set(_shown, false);
        }
    }
}