export function importTemplate(templateId) {
    return document.importNode(document.getElementById(templateId).content, true).children[0];
}