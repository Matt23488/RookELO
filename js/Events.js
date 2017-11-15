const _privateMembers = new Map();

const _listeners = Symbol("_listeners");

function _(self, symbol) {
    return _privateMembers.get(self).get(symbol);
}

export default class Events {
    constructor() {
        _privateMembers.set(this, new Map());

        _privateMembers.get(this).set(_listeners, new Set());
    }

    listen(name, callback) {
        _(this, _listeners).add({
            name,
            callback
        });
    }

    emit(name, ...data) {
        _(this, _listeners).forEach(listener => {
            if (listener.name === name) {
                listener.callback(...data);
            }
        });
    }
}