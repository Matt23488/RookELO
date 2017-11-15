import Component from "./Component.js";

const _privateMembers = new Map();

const _callbacks = Symbol("_callback");

function _(self, symbol) {
    return _privateMembers.get(self).get(symbol);
}

export default class ButtonComponent extends Component {
    constructor(selector) {
        super(selector);

        _privateMembers.set(this, new Map());

        _privateMembers.get(this).set(_callbacks, new Set());

        super.listen("click", ev => {
            _(this, _callbacks).forEach(callback => {
                callback(ev);
            });
        });
    }

    onClick(callback) {
        _(this, _callbacks).add(callback);
    }

    click() {
        super.emit("click");
    }
}