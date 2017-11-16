import Component from "./Component.js";
import { privateAccessorFactory } from "../utilities.js";

const _ = privateAccessorFactory();

const _callbacks = Symbol("_callback");

export default class ButtonComponent extends Component {
    constructor(selector) {
        super(selector);

        _.initialize(this);

        _(this).set(_callbacks, new Set());

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