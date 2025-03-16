import { ErrorMessages } from "../../Enums.js";
import { FitImage } from "../../Helpers.js";
import PhadeBlock from "../PhadeBlock.js";
import ErrorFeedbackBlock from "./ErrorFeedbackBlock.js";
import FileSelectorDialog from "./FileSelectorDialog.js";
import PhotoAlbum from "./PhotoAlbum.js";
export default class AlbumCreatorBlock extends PhadeBlock {
    EnableFS(caller) {
        this.fileSelector.caller = caller;
        this.fileSelector.Enable();
    }
    // Can start from existing album (when editing)
    // Default is empty album
    PrepareAlbum(album = new PhotoAlbum({ title: "New Album", description: "Your very own custom album for Mangerie Online, the finest kaleidoscope in the world!", cover: "", images: [] }, false), newAlbum = true) {
        this.album = album;
        this.newAlbum = newAlbum;
        this.content = [];
        album.content.forEach((photo) => { this.content.push(new AlbumCreatorLine(this, photo)); });
        if (this.content.length === 0)
            this.content.push(new AlbumCreatorLine(this));
    }
    // CREATE ALBUM: 
    // return false if album is invalid
    // return true if album is valid and saved to local storage
    CreateAlbum() {
        // 1. return early if no title
        if (this.albumTitle.value === "") {
            this.albumTitle.classList.add("in-error");
            this.albumTitle.focus({ preventScroll: true });
            this.albumTitle.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            this.Error = ErrorMessages.Album01;
            return false;
        }
        // 2. return early if no description
        if (this.albumDescription.value === "") {
            this.albumDescription.classList.add("in-error");
            this.albumDescription.focus({ preventScroll: true });
            this.albumTitle.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            this.Error = ErrorMessages.Album01b;
            return false;
        }
        // 3. return early if no images
        if (this.content.length <= 0) {
            this.Error = ErrorMessages.Album02;
            return false;
        }
        // 4. return early if images are incomplete
        let contentValid = true, newContent = [];
        for (let photo of this.content) {
            contentValid = photo.Validate();
            if (contentValid)
                newContent.push(photo.Result);
            if (!contentValid) {
                photo.SetClass("in-error");
                break;
            }
        }
        if (!contentValid) {
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
    RetrieveAlbum() {
        return [this.album, this.newAlbum];
    }
    set Error(value) {
        this.errorBlock.Message = value;
    }
    // LINE INTERFACE LOGIC
    FillImageList() {
        // First empty the container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        // Next append all photo's in order
        this.content.forEach((elem, index) => { elem.Append(index); });
        this.container.appendChild(this.addNewImageButton);
    }
    MoveLine(index, direction) {
        const line = this.content[index];
        this.pressSound.currentTime = 0;
        this.pressSound.play();
        // First test if new position is valid
        if ((index + direction < 0) || (index + direction >= this.content.length))
            return;
        this.content.splice(index, 1);
        if (direction != 0)
            this.content.splice(index + direction, 0, line);
        this.FillImageList();
    }
    // OVERRIDE ENABLE FUNCTION TO PREPARE FIELDS
    Enable() {
        super.Enable();
        this.albumTitle.value = this.album.title;
        this.albumDescription.value = this.album.description;
        this.FillImageList();
        this.content.forEach(line => line.SetPreview());
    }
    // CONSTRUCTOR
    constructor(mangerie) {
        const container = document.getElementById("album-creator");
        super(mangerie, container);
        // HTML PROPS
        this.container = document.getElementById("created-album-content");
        this.addNewImageButton = document.getElementById("add-new-image");
        // ELEMENTS FOR NEW ALBUM
        this.content = [];
        // ALBUM PROPS
        this.album = new PhotoAlbum({ title: "New Album", description: "", cover: "", images: [] }, false);
        this.newAlbum = true;
        // ERROR LOGIC
        this.errorLabel = document.getElementById("album-creator-error");
        this.errorBlock = new ErrorFeedbackBlock(this.errorLabel, mangerie.sounds.content.get("error").object);
        this.fileSelector = new FileSelectorDialog(mangerie);
        this.pressSound = mangerie.sounds.content.get("press").object;
        this.confirmSound = mangerie.sounds.content.get("bowl2").object;
        const albumHeader = document.getElementById("created-album-header");
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
        document.getElementById("add-new-image-button").addEventListener("click", (e) => {
            e.preventDefault();
            this.content.push(new AlbumCreatorLine(this));
            this.pressSound.currentTime = 0;
            this.pressSound.play();
            this.FillImageList();
        });
    }
    // MAIN UPDATE FUNCTION
    Update(delta) {
        super.Update(delta);
        this.fileSelector.Update(delta);
        this.errorBlock.Update(delta);
        return this.phase;
    }
}
class AlbumCreatorLine {
    get Result() {
        this.photo.desc = (this.description.value != "") ? this.description.value : this.photo.desc;
        this.photo.object = this.preview;
        return this.photo;
    }
    SetPreview() {
        const src = (this.photo.dataURL && this.photo.dataURL !== "") ? this.photo.dataURL : this.photo.src;
        this.preview.src = src;
    }
    DrawPreview() {
        const ctx = this.image.getContext("2d");
        // Normalize canvas width & height
        const cWidth = this.image.offsetWidth, cHeight = this.image.offsetHeight;
        this.image.width = cWidth;
        this.image.height = cHeight;
        // Clip image (if necessary)
        let [clipWidth, clipHeight, marginX, marginY] = FitImage(this.preview.naturalWidth, this.preview.naturalHeight, this.image);
        // Draw the canvas
        ctx.clearRect(0, 0, cWidth, cHeight);
        ctx.drawImage(this.preview, marginX, marginY, clipWidth, clipHeight);
    }
    // IMAGE SETTER
    set ReceivedFile(file) {
        if (file.type === "base64") {
            this.photo.dataURL = file.result;
        }
        else {
            this.photo.src = file.result;
            if (this.photo.dataURL)
                delete this.photo.dataURL;
        }
        this.container.classList.remove("in-error");
        this.container.classList.remove("error");
        this.SetPreview();
    }
    Validate() {
        let result = this.descriptionRequired ? this.description.value != "" : true;
        return result ? (this.photo.src != "" || (this.photo.dataURL != null && this.photo.dataURL != "")) : false;
    }
    SetClass(value) {
        this.container.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        this.container.classList.add(value);
    }
    Append(index) {
        this.index = index;
        const target = document.getElementById("created-album-content");
        target.appendChild(this.container);
    }
    // CONSTRUCTOR: create HTML & add event listeners
    constructor(parent, photo = { src: "", desc: "", object: new Image() }) {
        // PREVIEW IMAGE LOGIC
        this.preview = new Image();
        // VALIDATION: return false if no image
        this.descriptionRequired = true;
        // INDEX: set index while appending to list
        this.index = 0;
        this.photo = photo;
        this.albumCreator = parent;
        // HTML CREATION
        // 1. Main Container
        this.container = document.createElement("li");
        this.container.classList.add("album-added-image");
        // 2. Image + overlay to select new image
        const figure = document.createElement("figure");
        this.image = document.createElement("canvas");
        figure.appendChild(this.image);
        const overlay = new Image();
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
        const buttonContainer = document.createElement("nav");
        buttonContainer.classList.add("album-added-image-nav");
        this.container.appendChild(buttonContainer);
        // 4a. Move line up
        this.upButton = document.createElement("button");
        const upImage = new Image();
        upImage.src = "assets/arrow-up.svg";
        this.upButton.appendChild(upImage);
        this.upButton.classList.add("arrow");
        buttonContainer.appendChild(this.upButton);
        // 4b. Delete line
        this.deleteButton = document.createElement("button");
        const deleteImage = new Image();
        deleteImage.src = "assets/delete.svg";
        this.deleteButton.appendChild(deleteImage);
        this.deleteButton.classList.add("delete");
        buttonContainer.appendChild(this.deleteButton);
        // 4c. Move line down
        this.downButton = document.createElement("button");
        const downImage = new Image();
        downImage.src = "assets/arrow-down.svg";
        this.downButton.appendChild(downImage);
        this.downButton.classList.add("arrow");
        buttonContainer.appendChild(this.downButton);
        // EVENT LISTENERS
        // 1. Enable File selector
        figure.addEventListener("click", (e) => {
            e.preventDefault;
            this.albumCreator.EnableFS(this);
        });
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
