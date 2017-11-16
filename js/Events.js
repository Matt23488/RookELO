import { privateAccessorFactory } from "./utilities.js";

const _ = privateAccessorFactory();

const _listeners = Symbol("_listeners");

export default class Events {
    constructor() {

        _(this).set(_listeners, new Set());
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