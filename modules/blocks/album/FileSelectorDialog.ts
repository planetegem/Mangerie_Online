import { ErrorMessages, PhadePhase } from "../../Enums.js";
import { IFileReceiver } from "../../Interfaces.js";
import Mangerie from "../../Mangerie.js";
import PhadeModal from "../PhadeModal.js";
import ErrorFeedbackBlock from "./ErrorFeedbackBlock.js";

export default class FileSelectorDialog extends PhadeModal {

    // HTML ELEMENTS
    private exitButton: HTMLElement = document.getElementById("exit-file-selector")!;
    private urlInputLabel: HTMLElement = document.getElementById("url-input-label")!;
    private fileInputLabel: HTMLElement = document.getElementById("file-input-label")!;
    private urlInput: HTMLInputElement = document.getElementById("url-input")! as HTMLInputElement;
    private fileInput: HTMLInputElement = document.getElementById("file-input")! as HTMLInputElement;
    private fileInputFeedback: HTMLElement = document.getElementById("file-input-feedback")!;
    private confirmButton: HTMLElement = document.getElementById("confirm-file-selection")!;

    // CALLER: object expecting a response
    public caller: IFileReceiver | null = null;

    // SOUND EFFECTS
    private exitSound: HTMLAudioElement;
    private PlayExitSound(): void {
        this.exitSound.currentTime = 0;
        this.exitSound.play();
    }
    private entrySound: HTMLAudioElement;
    private PlayEntrySound(): void {
        this.entrySound.currentTime = 0;
        this.entrySound.play();
    }
    private selectSound: HTMLAudioElement;
    private PlaySelectSound(): void {
        this.selectSound.currentTime = 0;
        this.selectSound.play();
    }

    // SELECTION LOGIC:
    // 0 = nothing selected, 1 = external url, 2 = uploaded file
    private selectedOption: number = 0;
    private set Option(value: number) {
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
    private errorLabel: HTMLElement = document.getElementById("file-selector-error")!;
    private errorBlock: ErrorFeedbackBlock;
    private set Error(value: ErrorMessages | null){
       this.errorBlock.Message = value;
    }    

    // THINKING: block interaction if processing input
    private thinking: boolean = false;
    private set Thinking(value: boolean) {
        this.thinking = value;
        const cursor: string = value ? "wait" : "";

        this.modal.style.cursor = cursor;
        this.confirmButton.style.cursor = cursor;
        this.urlInputLabel.style.cursor = cursor;
        this.fileInputLabel.style.cursor = cursor;
        this.exitButton.style.cursor = cursor;
    }

    // CONSTRUCTOR: mainly event listeners
    constructor(mangerie: Mangerie) {
        const dialog: HTMLDialogElement = document.getElementById("file-selector")! as HTMLDialogElement;
        super(dialog);
        this.errorBlock = new ErrorFeedbackBlock(this.errorLabel, mangerie.sounds.content.get("error")!.object);
        this.exitSound = mangerie.sounds.content.get("bowl")!.object;
        this.entrySound = mangerie.sounds.content.get("bowl2")!.object;
        this.selectSound = mangerie.sounds.content.get("press")!.object;


        // EVENT LISTENERS
        // 1. Exit without saving (upper right corner X)
        this.exitButton.addEventListener("click", (e) => {
            e.preventDefault;
            this.PlayExitSound();

            if (this.thinking) return;
            this.Disable();
        });

        // 2. Select which option will be passed to caller
        this.urlInputLabel.addEventListener("click", () => {
            if (this.thinking) return;
            this.PlaySelectSound();
            this.Option = 1;
        });
        this.fileInputLabel.addEventListener("click", () => {
            if (this.thinking) return;
            this.PlaySelectSound();
            this.Option = 2;
        });

        // 3. Feedback after selecting file
        this.fileInput.addEventListener("change", () => {
            if (this.thinking) return;

            if(this.fileInput.files?.length == 1){
                this.fileInputFeedback.innerText = "Selected file: " + this.fileInput.files[0].name;
            } else if (this.fileInput.files?.length == 0){
                this.fileInputFeedback.innerText = "Selected file: none";
            }
        });
        
        // 4. Unselect file input if cancelling
        this.fileInput.addEventListener("cancel", () => {
            if(this.fileInput.files?.length === 0) this.Option = 0;
        });

        // 5. Confirmation flow
        this.confirmButton.addEventListener("click", (e) => {
            if (this.thinking) return;
            this.Thinking = true;
            
            switch (this.selectedOption){
                case 0:
                    this.Error = ErrorMessages.File01;
                    this.Thinking = false;
                    break;
                case 1:
                    const submission: string = this.urlInput.value;
                    if (submission === "") {
                        this.Error = ErrorMessages.File02;
                        this.Thinking = false;
                    } else {
                        // validate url by attempting to load image
                        const testImg: HTMLImageElement = new Image();
                        testImg.onerror = () => {
                            this.Error = ErrorMessages.File03;
                            this.Thinking = false;
                        };
                        testImg.onload = () => {
                            if (this.caller) {
                                this.caller.ReceivedFile = {result: submission, type: "image"};
                                this.Thinking = false;
                                this.PlayEntrySound();
                                this.Disable();
                            } else {
                                console.warn("something went wrong with FileSelector: no caller was assigned");
                            }
                        };
                        testImg.src = submission;
                    }
                    break;
                case 2:
                    if (this.fileInput.files === null || this.fileInput.files.length === 0){
                        this.Error = ErrorMessages.File04;
                        this.Thinking = false;
                    } else {
                        const reader: FileReader = new FileReader();
                        reader.addEventListener("load", () => {
                            if (!reader.result){
                                this.Error = ErrorMessages.File05;
                                this.Thinking = false;
                            } else {
                                if (this.caller) {
                                    this.caller.ReceivedFile = {result: reader.result as string, type: "base64"};
                                    this.Thinking = false;
                                    this.Disable();
                                } else {
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
    public Disable(): void {
        (this.modal as HTMLDialogElement).close();
        this.modal.style.display = "none";
        this.urlInput.value = "";
    }

    // OVERRIDE ENABLE: reset props and open dialog
    public Enable(): void {
        if (this.caller == null){
            console.log("File selector enabled without assigning caller!");
            return;
        }

        super.Enable();

        this.fileInputFeedback.innerText = "Selected file: none";
        this.Option = 0;
        this.Error = null;
        (this.modal as HTMLDialogElement).showModal();
    }

    public Update(delta: number): PhadePhase {
        super.Update(delta);
        this.errorBlock.Update(delta);

        return this.phase;
    }
}