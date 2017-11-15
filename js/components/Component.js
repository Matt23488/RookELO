const _privateMembers = new Map();

const _element = Symbol("_element");
const _events = Symbol("_events");

const _fGetElementFromSelector = Symbol("_getElementFromSelector()");

function _(component, symbol) {
    return _privateMembers.get(component).get(symbol);
}

export default class Component {
    constructor(elementOrSelector, parentComponent) {
        const parentElement = parentComponent ? _(parentComponent, _element) : document;
        _privateMembers.set(this, new Map());
        _privateMembers.get(this).set(_events, new Map());
        _privateMembers.get(this).set(_fGetElementFromSelector, getElementFromSelectorFactory(this));
        let element;


        if (elementOrSelector instanceof HTMLElement) {
            element = elementOrSelector;
        }
        else {
            element = parentElement.querySelector(elementOrSelector);
        }

        _privateMembers.get(this).set(_element, element);
    }

    // TODO: I need to remove this. It's referenced in NewPlayerModal.
    // I'm just too lazy to do it now after this major refactor.
    get element() { return _(this, _element); }

    get value() { return _(this, _element).value; }
    set value(value) { _privateMembers.get(this).set(_element, value); }

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

function getElementFromSelectorFactory(component) {
    return selector => {
        const element = _(component, _element);
        return selector ? element.querySelector(selector) : element;
    };
}