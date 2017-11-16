let manager;
let calledViaGetInstance = false;

export default class ToastManager {
    constructor() {
        if (!calledViaGetInstance) throw new Error("You must use the static getInstance() method to get a reference to this class.");
    }

    static getInstance() {
        calledViaGetInstance = true;
        if (!manager) manager = new ToastManager();
        calledViaGetInstance = false;
        return manager;
    }
}

// class ToastMessage {

// }