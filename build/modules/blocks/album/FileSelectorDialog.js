import { ErrorMessages } from "../../Enums.js";
import PhadeModal from "../PhadeModal.js";
export default class FileSelectorDialog extends PhadeModal {
    set Option(value) {
        switch (value) {
            case 0:
                this.fileInputLabel.classList.remove("selected");
                this.urlInputLabel.classList.remove("selected");
                break;
            case 1:
                this.urlInputLabel.classList.add("selected");
                this.fileInputLabel.classList.remove("selected");
                break;
            case 2:
                this.fileInputLabel.classList.add("selected");
                this.urlInputLabel.classList.remove("selected");
                break;
        }
        this.selectedOption = value;
    }
    // ERROR FEEDBACK: if error, clone and replace error span to restart animation
    set Error(value) {
        if (value === null) {
            this.errorLabel.classList.remove("active");
        }
        else {
            this.errorLabel.innerText = value;
            this.errorLabel.classList.add("active");
            const replacement = this.errorLabel.cloneNode(true);
            this.errorLabel.parentNode.replaceChild(replacement, this.errorLabel);
            this.errorLabel = replacement;
        }
    }
    set Thinking(value) {
        this.thinking = value;
        const cursor = value ? "wait" : "";
        this.modal.style.cursor = cursor;
        this.confirmButton.style.cursor = cursor;
        this.urlInputLabel.style.cursor = cursor;
        this.fileInputLabel.style.cursor = cursor;
        this.exitButton.style.cursor = cursor;
    }
    // CONSTRUCTOR: mainly event listeners
    constructor() {
        const dialog = document.getElementById("file-selector");
        super(dialog);
        // HTML ELEMENTS
        this.exitButton = document.getElementById("exit-file-selector");
        this.urlInputLabel = document.getElementById("url-input-label");
        this.fileInputLabel = document.getElementById("file-input-label");
        this.urlInput = document.getElementById("url-input");
        this.fileInput = document.getElementById("file-input");
        this.fileInputFeedback = document.getElementById("file-input-feedback");
        this.confirmButton = document.getElementById("confirm-file-selection");
        this.errorLabel = document.getElementById("file-selector-error");
        // CALLER: object expecting a response
        this.caller = null;
        // SELECTION LOGIC:
        // 0 = nothing selected, 1 = external url, 2 = uploaded file
        this.selectedOption = 0;
        // THINKING: block interaction if processing input
        this.thinking = false;
        // EVENT LISTENERS
        // 1. Exit without saving (upper right corner X)
        this.exitButton.addEventListener("click", (e) => {
            e.preventDefault;
            if (this.thinking)
                return;
            this.Disable();
        });
        // 2. Select which option will be passed to caller
        this.urlInputLabel.addEventListener("click", () => {
            if (this.thinking)
                return;
            this.Option = 1;
        });
        this.fileInputLabel.addEventListener("click", () => {
            if (this.thinking)
                return;
            this.Option = 2;
        });
        // 3. Feedback after selecting file
        this.fileInput.addEventListener("change", () => {
            var _a, _b;
            if (this.thinking)
                return;
            if (((_a = this.fileInput.files) === null || _a === void 0 ? void 0 : _a.length) == 1) {
                this.fileInputFeedback.innerText = "Selected file: " + this.fileInput.files[0].name;
            }
            else if (((_b = this.fileInput.files) === null || _b === void 0 ? void 0 : _b.length) == 0) {
                this.fileInputFeedback.innerText = "Selected file: none";
            }
        });
        // 4. Unselect file input if cancelling
        this.fileInput.addEventListener("cancel", () => {
            var _a;
            if (((_a = this.fileInput.files) === null || _a === void 0 ? void 0 : _a.length) === 0)
                this.Option = 0;
        });
        // 5. Confirmation flow
        this.confirmButton.addEventListener("click", (e) => {
            if (this.thinking)
                return;
            this.Thinking = true;
            switch (this.selectedOption) {
                case 0:
                    this.Error = ErrorMessages.File01;
                    this.Thinking = false;
                    break;
                case 1:
                    const submission = this.urlInput.value;
                    if (submission === "") {
                        this.Error = ErrorMessages.File02;
                        this.Thinking = false;
                    }
                    else {
                        // validate url by attempting to load image
                        const testImg = new Image();
                        testImg.onerror = () => {
                            this.Error = ErrorMessages.File03;
                            this.Thinking = false;
                        };
                        testImg.onload = () => {
                            if (this.caller) {
                                this.caller.ReceivedFile = { result: submission, type: "image" };
                                this.Thinking = false;
                                this.Disable();
                            }
                            else {
                                console.warn("something went wrong with FileSelector: no caller was assigned");
                            }
                        };
                        testImg.src = submission;
                    }
                    break;
                case 2:
                    if (this.fileInput.files === null || this.fileInput.files.length === 0) {
                        this.Error = ErrorMessages.File04;
                        this.Thinking = false;
                    }
                    else {
                        const reader = new FileReader();
                        reader.addEventListener("load", () => {
                            if (!reader.result) {
                                this.Error = ErrorMessages.File05;
                                this.Thinking = false;
                            }
                            else {
                                if (this.caller) {
                                    this.caller.ReceivedFile = { result: reader.result, type: "base64" };
                                    this.Thinking = false;
                                    this.Disable();
                                }
                                else {
                                    console.warn("something went wrong with FileSelector: no caller was assigned");
                                }
                            }
                        }, false);
                        reader.readAsDataURL(this.fileInput.files[0]);
                    }
                    break;
            }
        });
    }
    // OVERRIDE DISABLE: close dialog
    Disable() {
        this.modal.close();
        this.modal.style.display = "none";
        this.urlInput.value = "";
    }
    // OVERRIDE ENABLE: reset props and open dialog
    Enable() {
        if (this.caller == null) {
            console.log("File selector enabled without assigning caller!");
            return;
        }
        super.Enable();
        this.fileInputFeedback.innerText = "Selected file: none";
        this.Option = 0;
        this.Error = null;
        this.modal.showModal();
    }
}
