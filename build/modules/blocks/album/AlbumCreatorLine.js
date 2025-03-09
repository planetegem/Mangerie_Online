import { FitImage } from "../../Helpers.js";
export default class AlbumCreatorLine {
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
