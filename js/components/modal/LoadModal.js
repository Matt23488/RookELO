import ModalComponent from "./Modal.js";

export default class LoadModalComponent extends ModalComponent {
    constructor() {
        super();

        super.text = "Would you like to load from Google Drive or upload a file?";
        super.addButton("googleButton", "Google Drive", "google", false);
        super.addButton("uploadButton", "Upload", "upload", true);
    }
}