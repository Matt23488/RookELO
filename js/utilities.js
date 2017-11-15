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