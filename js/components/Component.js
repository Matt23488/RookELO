export default class Component {
    constructor(element) {
        this._element = element;
    }

    get element() { return this._element; }
}