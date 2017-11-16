import { privateAccessorFactory } from "../utilities.js";

const _ = privateAccessorFactory();

const _element = Symbol("_element");
const _events = Symbol("_events");

const _fGetElementFromSelector = Symbol("_getElementFromSelector()");

export default class Component {
    constructor(elementOrSelector, parentComponent) {
        const parentElement = parentComponent ? _(parentComponent, _element) : document;

        _(this).set(_events, new Map());
        _(this).set(_fGetElementFromSelector, getElementFromSelectorFactory(this));
        
        let element;


        if (elementOrSelector instanceof HTMLElement) {
            element = elementOrSelector;
        }
        else {
            element = parentElement.querySelector(elementOrSelector);
        }

        _(this).set(_element, element);
    }

    // TODO: I need to remove this. It's referenced in NewPlayerModal.
    // I'm just too lazy to do it now after this major refactor.
    get element() { return _(this, _element); }

    get value() { return _(this, _element).value; }
    set value(value) { _(this).set(_element, value); }

    get style() { return _(this, _element).style; }
    get classList() { return _(this, _element).classList; }

    get height() { return _(this, _element).clientHeight; }
    get width() { return _(this, _element).clientWidth; }

    append(child, selector) {
        _(this, _fGetElementFromSelector)(selector).appendChild(_(child, _element));
    }

    remove(child) {
        if (child) {
            _(this, _element).removeChild(_(child, _element));
        }
        else {
            _(this, _element).remove();
        }
    }

    updateText(text, selector) {
        _(this, _fGetElementFromSelector)(selector).innerText = text;
    }

    updateHtml(html, selector) {
        _(this, _fGetElementFromSelector)(selector).innerHTML = html;
    }

    setVisibility(shouldBeVisible, selector) {
        _(this, _fGetElementFromSelector)(selector).classList.toggle("HIDDEN", !shouldBeVisible);
    }

    listen(eventName, callback, selector) {
        _(this, _fGetElementFromSelector)(selector).addEventListener(eventName, callback);
    }
    unListen(eventName, callback, selector) {
        _(this, _fGetElementFromSelector)(selector).removeEventListener(eventName, callback);
    }

    emit(eventName, selector) {
        let event;
        if (!_(this, _events).has(eventName)) {
            event = new Event(eventName);
            _(this, _events).set(eventName, event);
        }
        else {
            event = _(this, _events).get(eventName);
        }

        _(this, _fGetElementFromSelector)(selector).dispatchEvent(event);
    }

    setAttribute(attributeName, value, selector) {
        _(this, _fGetElementFromSelector)(selector).setAttribute(attributeName, value);
    }
}

function getElementFromSelectorFactory(self) {
    return selector => {
        const element = _(self, _element);
        return selector ? element.querySelector(selector) : element;
    };
}