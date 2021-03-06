export function importTemplate(templateId) {
    return document.importNode(document.getElementById(templateId).content, true).children[0];
}

export function preventDefault(ev) { ev.preventDefault(); }
export function getFileFromEvent(ev) {
    let file;
    if (ev.dataTransfer.items) {
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === "file") {
                file = ev.dataTransfer.items[i].getAsFile();
            }
        }
    }
    else {
        file = ev.dataTransfer.files[0];
    }
    return file;
}

export function privateAccessorFactory() {
    const privateMembers = new Map();
    
    return function(self, symbol) {
        if (!privateMembers.has(self)) {
            privateMembers.set(self, new Map());
        }

        if (symbol) return privateMembers.get(self).get(symbol);
        else        return privateMembers.get(self);
    };
}

export function max(a, b, expression) {
    if (!expression) expression = obj => obj;
    return expression(a) > expression(b) ? a : b;
}

export function min(a, b, expression) {
    if (!expression) expression = obj => obj;
    return expression(a) < expression(b) ? a : b;
}

export function compareArrays(arrA, arrB) {
    if (arrA.length !== arrB.length) return false;

    for (let i = 0; i < arrA.length; i++) {
        if (arrA[i] !== arrB[i]) return false;
    }

    return true;
}