import Component from "./Component.js";
import { importTemplate } from "../utilities.js";

let manager;
let calledViaGetInstance = false;

let _body;
let _activeMessages;
let _nextBottomPosition;

export default class ToastManager {
    constructor() {
        if (!calledViaGetInstance) throw new Error("You must use the static getInstance() method to get a reference to this class.");

        _body = new Component(document.body);
        _activeMessages = new Set();
        _nextBottomPosition = 10;
    }

    static getInstance() {
        calledViaGetInstance = true;
        if (!manager) manager = new ToastManager();
        calledViaGetInstance = false;
        return manager;
    }

    displayMessage(text, type = ToastType.info) {
        const toast = new ToastMessageComponent(text, type);
        _activeMessages.add(toast);
        
        toast.style.bottom = `${_nextBottomPosition}px`;
        _body.append(toast);
        _nextBottomPosition += toast.height + 10;

        window.setTimeout(() => {
            toast.remove();
            _activeMessages.delete(toast);
            arrangeActiveMessages();
        }, 6010);
    }
}

function arrangeActiveMessages() {
    let bottom = 10;
    _activeMessages.forEach(msg => {
        msg.style.bottom = `${bottom}px`;
        bottom += msg.height + 10;
    });
    _nextBottomPosition = bottom;
}

class ToastMessageComponent extends Component {
    constructor(text, type) {
        super(importTemplate("toastTemplate"));

        super.updateHtml(text);
        super.classList.add(type);
    }
}

export const ToastType = {
    info: "info",
    success: "success",
    error: "error"
};