import { ErrorMessages, PhadePhase } from "../../Enums.js";
import { FitImage } from "../../Helpers.js";
import { AssetObject, IFileReceiver, IFileResult } from "../../Interfaces.js";
import Mangerie from "../../Mangerie.js";
import PhadeBlock from "../PhadeBlock.js";
import ErrorFeedbackBlock from "./ErrorFeedbackBlock.js";
import FileSelectorDialog from "./FileSelectorDialog.js";
import PhotoAlbum from "./PhotoAlbum.js";

export default class AlbumCreatorBlock extends PhadeBlock {

    // HTML PROPS
    private container: HTMLElement = document.getElementById("created-album-content")!;
    private addNewImageButton: HTMLElement = document.getElementById("add-new-image")!;
    private albumTitle: HTMLInputElement;
    private albumDescription: HTMLTextAreaElement;

    // FILE SELECTOR: shared by all album lines
    private fileSelector: FileSelectorDialog;
    public EnableFS(caller: IFileReceiver): void {
        this.fileSelector.caller = caller;
        this.fileSelector.Enable();
    }

    // ELEMENTS FOR NEW ALBUM
    private content: AlbumCreatorLine[] = [];

    // ALBUM PROPS
    private album: PhotoAlbum = new PhotoAlbum({title: "New Album", description: "", cover: "", images: []}, false);
    private newAlbum: boolean = true;

    // Can start from existing album (when editing)
    // Default is empty album
    public PrepareAlbum(album: PhotoAlbum = new PhotoAlbum({title: "New Album", description: "Your very own custom album for Mangerie Online, the finest kaleidoscope in the world!", cover: "", images: []}, false), newAlbum: boolean = true): void {
        this.album = album;
        this.newAlbum = newAlbum;

        this.content = [];
        album.content.forEach((photo) => {this.content.push(new AlbumCreatorLine(this, photo))});
        if (this.content.length === 0) this.content.push(new AlbumCreatorLine(this));
    }
   
    // CREATE ALBUM: 
    // return false if album is invalid
    // return true if album is valid and saved to local storage
    public CreateAlbum(): boolean {

        // 1. return early if no title
        if (this.albumTitle.value === ""){
            this.albumTitle.classList.add("in-error");
            this.albumTitle.focus({preventScroll: true});
            this.albumTitle.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });

            this.Error = ErrorMessages.Album01;
            return false;
        }

        // 2. return early if no description
        if (this.albumDescription.value === ""){
            this.albumDescription.classList.add("in-error");
            this.albumDescription.focus({preventScroll: true});
            this.albumTitle.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });

            this.Error = ErrorMessages.Album01b;
            return false;
        }
        
        // 3. return early if no images
        if (this.content.length <= 0){
            this.Error = ErrorMessages.Album02;
            return false;
        }

        // 4. return early if images are incomplete
        let contentValid: boolean = true, newContent: AssetObject<HTMLImageElement>[] = [];
        for (let photo of this.content) {
            contentValid = photo.Validate();

            if (contentValid) newContent.push(photo.Result);
            if (!contentValid){
                photo.SetClass("in-error");
                break;
            }
        }
        if (!contentValid){
            this.Error = ErrorMessages.Album03;
            return false;
        }

        // 5. succes!
        this.album.title = this.albumTitle.value;
        this.album.description = this.albumDescription.value;
        this.album.content = newContent;
        this.confirmSound.currentTime = 0;
        this.confirmSound.play();
        return true;
    }
    public RetrieveAlbum(): [album: PhotoAlbum, newAlbum: boolean]{
        return [this.album, this.newAlbum];
    }

    // ERROR LOGIC
    private errorLabel: HTMLElement = document.getElementById("album-creator-error")!;
    private errorBlock: ErrorFeedbackBlock;
    private set Error(value: ErrorMessages | null){
        this.errorBlock.Message = value;
    }    
    
    // LINE INTERFACE LOGIC
    private FillImageList(): void {
        // First empty the container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        // Next append all photo's in order
        this.content.forEach((elem, index) => {elem.Append(index)});
        this.container.appendChild(this.addNewImageButton);
    }
    public MoveLine(index: number, direction: number): void {
        const line: AlbumCreatorLine = this.content[index];
        this.pressSound.currentTime = 0;
        this.pressSound.play();

        // First test if new position is valid
        if ((index + direction < 0) || (index + direction >= this.content.length)) return;

        this.content.splice(index, 1);
        if (direction != 0) this.content.splice(index + direction, 0, line);
        this.FillImageList();

    }

    // OVERRIDE ENABLE FUNCTION TO PREPARE FIELDS
    public Enable(): void {
        super.Enable();

        this.albumTitle.value = this.album.title;
        this.albumDescription.value = this.album.description;
        this.FillImageList();
        this.content.forEach(line => line.SetPreview());
    }

    // SOUND EFFECTS
    private pressSound: HTMLAudioElement;
    private confirmSound: HTMLAudioElement;

    // CONSTRUCTOR
    constructor(mangerie: Mangerie){
        const container: HTMLElement = document.getElementById("album-creator")!;
        super(mangerie, container);

        this.errorBlock = new ErrorFeedbackBlock(this.errorLabel, mangerie.sounds.content.get("error")!.object);
        this.fileSelector = new FileSelectorDialog(mangerie);
        this.pressSound = mangerie.sounds.content.get("press")!.object;
        this.confirmSound = mangerie.sounds.content.get("bowl2")!.object;

        const albumHeader: HTMLElement = document.getElementById("created-album-header")!;
        this.albumTitle = document.createElement("input");
        this.albumTitle.type = "text";
        this.albumTitle.id = "album-title";
        this.albumTitle.maxLength = 35;
        this.albumTitle.placeholder = "Name your custom album";
        albumHeader.appendChild(this.albumTitle);
        this.albumTitle.oninput = () => { 
            this.albumTitle.classList.remove("in-error");
            this.albumTitle.classList.remove("error");
        };        

        this.albumDescription = document.createElement("textarea");
        this.albumDescription.id = "album-description";
        this.albumDescription.placeholder = "This is where the description for your custom photo album goes...";
        this.albumDescription.maxLength = 150;
        albumHeader.appendChild(this.albumDescription);
        this.albumDescription.oninput = () => { 
            this.albumDescription.classList.remove("in-error");
            this.albumDescription.classList.remove("error");
        };

        document.getElementById("add-new-image-button")!.addEventListener("click", (e) => {
            e.preventDefault();
            this.content.push(new AlbumCreatorLine(this));
            this.pressSound.currentTime = 0;
            this.pressSound.play();
            this.FillImageList();
        });
    }

    // MAIN UPDATE FUNCTION
    public Update(delta: number): PhadePhase {
        super.Update(delta);
        this.fileSelector.Update(delta);
        this.errorBlock.Update(delta);

        return this.phase;
    }
}

class AlbumCreatorLine implements IFileReceiver {
    private photo: AssetObject<HTMLImageElement>;
    public get Result(): AssetObject<HTMLImageElement> {
        this.photo.desc = (this.description.value != "") ? this.description.value : this.photo.desc;
        this.photo.object = this.preview;
        return this.photo;
    }
    private albumCreator: AlbumCreatorBlock;

    // HTML props
    private description: HTMLTextAreaElement;
    private image: HTMLCanvasElement;
    private container: HTMLElement;
    private upButton: HTMLButtonElement;
    private downButton: HTMLButtonElement;
    private deleteButton: HTMLButtonElement;

    // PREVIEW IMAGE LOGIC
    private preview: HTMLImageElement = new Image();
    public SetPreview(): void {
        const src: string = (this.photo.dataURL && this.photo.dataURL !== "") ? this.photo.dataURL : this.photo.src;
        this.preview.src = src;       
    }
    private DrawPreview(): void {
        const ctx: CanvasRenderingContext2D = this.image.getContext("2d")!;

        // Normalize canvas width & height
        const cWidth: number = this.image.offsetWidth, cHeight: number = this.image.offsetHeight;
        this.image.width = cWidth;
        this.image.height = cHeight;

        // Clip image (if necessary)
        let [clipWidth, clipHeight, marginX, marginY] = FitImage(this.preview.naturalWidth, this.preview.naturalHeight, this.image);

        // Draw the canvas
        ctx.clearRect(0, 0, cWidth, cHeight);
        ctx.drawImage(this.preview, marginX, marginY, clipWidth, clipHeight);
    }

    // IMAGE SETTER
    public set ReceivedFile(file: IFileResult){
        if (file.type === "base64"){
            this.photo.dataURL = file.result;
        } else {
            this.photo.src = file.result;
            if (this.photo.dataURL) delete this.photo.dataURL;
        }
        this.container.classList.remove("in-error");
        this.container.classList.remove("error");
        this.SetPreview();
    }
    
    // VALIDATION: return false if no image
    private descriptionRequired: boolean = true;
    public Validate(): boolean {
        let result: boolean = this.descriptionRequired ? this.description.value != "" : true;
        return result ? (this.photo.src != "" || (this.photo.dataURL != null && this.photo.dataURL != "")) : false;
    }
    public SetClass(value: string): void {
        this.container.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        this.container.classList.add(value);
    }

    // INDEX: set index while appending to list
    private index: number = 0;
    public Append(index: number): void{
        this.index = index;
        const target: HTMLElement = document.getElementById("created-album-content")!;
        target.appendChild(this.container);
    }

    // CONSTRUCTOR: create HTML & add event listeners
    constructor(parent: AlbumCreatorBlock, photo: AssetObject<HTMLImageElement> = {src: "", desc: "", object: new Image()}){
        this.photo = photo;
        this.albumCreator = parent;

        // HTML CREATION
        // 1. Main Container
        this.container = document.createElement("li");
        this.container.classList.add("album-added-image");

        // 2. Image + overlay to select new image
        const figure: HTMLElement = document.createElement("figure");
        this.image = document.createElement("canvas");
        figure.appendChild(this.image);

        const overlay: HTMLImageElement = new Image();
        overlay.src = "assets/blank_overlay.webp";
        overlay.classList.add("overlay");
        figure.appendChild(overlay);
        this.container.appendChild(figure);

        // 3. Description field
        this.description = document.createElement("textarea");
        this.description.value = this.photo.desc;
        this.description.placeholder = "Enter a description for your image here...";
        this.description.maxLength = 160;
        this.container.appendChild(this.description);
        this.description.oninput = () => { 
            this.container.classList.remove("in-error");
            this.container.classList.remove("error"); 
        };

        // 4. Line management buttons
        const buttonContainer: HTMLElement = document.createElement("nav");
        buttonContainer.classList.add("album-added-image-nav");
        this.container.appendChild(buttonContainer);

        // 4a. Move line up
        this.upButton = document.createElement("button");
        const upImage: HTMLImageElement = new Image();
        upImage.src = "assets/arrow-up.svg";
        this.upButton.appendChild(upImage);
        this.upButton.classList.add("arrow");
        buttonContainer.appendChild(this.upButton);
        
        // 4b. Delete line
        this.deleteButton = document.createElement("button");
        const deleteImage: HTMLImageElement = new Image();
        deleteImage.src = "assets/delete.svg";
        this.deleteButton.appendChild(deleteImage);
        this.deleteButton.classList.add("delete");
        buttonContainer.appendChild(this.deleteButton);

        // 4c. Move line down
        this.downButton = document.createElement("button");
        const downImage: HTMLImageElement = new Image();
        downImage.src = "assets/arrow-down.svg";
        this.downButton.appendChild(downImage);
        this.downButton.classList.add("arrow");
        buttonContainer.appendChild(this.downButton);

        // EVENT LISTENERS
        // 1. Enable File selector
        figure.addEventListener("click", (e) => {
            e.preventDefault;
            this.albumCreator.EnableFS(this);
        })

        // 2. Line movement/deletion
        this.upButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.albumCreator.MoveLine(this.index, -1);
        });
        this.deleteButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.albumCreator.MoveLine(this.index, 0);
        });
        this.downButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.albumCreator.MoveLine(this.index, 1);
        });

        // PREVIEW SETUP
        // On error: use fallback image
        // On load: draw preview on canvas
        this.preview.onerror = () => { this.preview.src = "assets/blank.webp"; };
        this.preview.onload = () => { this.DrawPreview(); };
        this.SetPreview();

        window.addEventListener("resize", () => this.DrawPreview());
    }    
}