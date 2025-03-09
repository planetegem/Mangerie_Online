import { ErrorMessages } from "../../Enums.js";
import { FitImage } from "../../Helpers.js";
import PhadeBlock from "../PhadeBlock.js";
import FileSelectorDialog from "./FileSelectorDialog.js";
import PhotoAlbum from "./PhotoAlbum.js";
export default class AlbumCreatorBlock extends PhadeBlock {
    EnableFS(caller) {
        this.fileSelector.caller = caller;
        this.fileSelector.Enable();
    }
    // Can start from existing album (when editing)
    // Default is empty album
    PrepareAlbum(album = new PhotoAlbum({ title: "New Album", description: "", cover: "", images: [] }, false), newAlbum = true) {
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
        // Error flow: no title or description
        if (this.albumTitle.value === "" || this.albumDescription.value === "") {
            this.albumTitle.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            this.Error = ErrorMessages.Album01;
            return false;
        }
        this.album.title = this.albumTitle.value;
        this.album.description = this.albumDescription.value;
        // Error flow: no images
        if (this.content.length <= 0) {
            this.Error = ErrorMessages.Album02;
            return false;
        }
        // Error flow: there are images, but some of them are incomplete
        let contentValid = true, newContent = [];
        for (let photo of this.content) {
            contentValid = photo.Validate();
            if (contentValid)
                newContent.push(photo.Result);
            if (!contentValid)
                break;
        }
        if (contentValid) {
            this.album.content = newContent;
            return true;
        }
        else {
            this.Error = ErrorMessages.Album03;
            return false;
        }
    }
    RetrieveAlbum() {
        return [this.album, this.newAlbum];
    }
    // ERROR LOGIC
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
        this.errorLabel = document.getElementById("album-creator-error");
        // ELEMENTS FOR NEW ALBUM
        this.content = [];
        // ALBUM PROPS
        this.album = new PhotoAlbum({ title: "New Album", description: "", cover: "", images: [] }, false);
        this.newAlbum = true;
        this.fileSelector = new FileSelectorDialog();
        const albumHeader = document.getElementById("created-album-header");
        this.albumTitle = document.createElement("input");
        this.albumTitle.type = "text";
        this.albumTitle.id = "album-title";
        albumHeader.appendChild(this.albumTitle);
        this.albumDescription = document.createElement("textarea");
        this.albumDescription.id = "album-description";
        this.albumDescription.placeholder = "This is where the description for your custom photo album goes...";
        albumHeader.appendChild(this.albumDescription);
        document.getElementById("add-new-image-button").addEventListener("click", (e) => {
            e.preventDefault();
            this.content.push(new AlbumCreatorLine(this));
            const cb = this.FillImageList.bind(this);
            cb();
        });
    }
    // MAIN UPDATE FUNCTION
    Update(delta) {
        super.Update(delta);
        this.fileSelector.Update(delta);
        return this.phase;
    }
}
class AlbumCreatorLine {
    get Result() {
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
        this.SetPreview();
    }
    SetImage(src, base64 = false) {
        if (base64) {
            this.photo.dataURL = src;
        }
        else {
            this.photo.src = src;
            if (this.photo.dataURL)
                delete this.photo.dataURL;
        }
        this.SetPreview();
    }
    Validate() {
        if (this.description.value != "")
            this.photo.desc = this.description.value;
        console.log(this.photo);
        let result = this.descriptionRequired ? this.description.value != "" : true;
        return result ? (this.photo.src != "" || (this.photo.dataURL != null && this.photo.dataURL != "")) : false;
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
        this.container.appendChild(this.description);
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
