import { FitImage } from "../../Helpers.js";
import PhadeBlock from "../PhadeBlock.js";
// ALBUM PICKER
// Load photo albums as selectable items
export default class AlbumPickerBlock extends PhadeBlock {
    // OVERRIDE ENABLE METHOD: ADD LOGIC TO CREATE ALBUM ITEMS
    Enable() {
        super.Enable();
        while (this.albumList.firstChild) {
            this.albumList.removeChild(this.albumList.firstChild);
        }
        this.albums = [];
        this.mangerie.Albums.forEach((album) => {
            const albumLi = new AlbumPickerLine(this, album);
            this.albums.push(albumLi);
        });
        this.UpdateSelection();
        this.albumList.appendChild(this.createNewAlbum);
    }
    // RETURN TO MANAGER (REQUESTED BY LINE)
    DeleteAlbum(album) {
        this.mangerie.Albums.splice(album.index, 1);
        this.manager.SaveToStorage();
    }
    EditAlbum(album) {
        this.manager.OpenAlbumEditor(album);
    }
    // UPDATE SELECTION
    UpdateSelection(index = this.mangerie.albumIndex) {
        this.mangerie.albumIndex = index;
        this.albums.forEach(album => {
            album.SetSelected(index);
        });
    }
    // CONSTRUCTOR: SET EVENT LISTENERS
    constructor(mangerie, manager) {
        const selector = document.getElementById("album-selector");
        super(mangerie, selector);
        // HTML Elements
        this.albumList = document.getElementById("album-list");
        this.createNewAlbum = document.getElementById("create-new-album");
        // ALBUM ITEMS
        this.albums = [];
        this.manager = manager;
        this.durationIn = 350;
        this.durationOut = 350;
    }
}
// LINE ELEMENT GENERATED FOR EVERY ALBUM FOUND
class AlbumPickerLine {
    SetSelected(index) {
        this.selected = (this.album.index === index);
        this.selectButton.innerText = (this.selected) ? "selected" : "select";
        if (this.selected) {
            this.container.classList.add("selected");
        }
        else {
            this.container.classList.remove("selected");
        }
    }
    DrawPreview() {
        const ctx = this.canvas.getContext("2d");
        // Normalize canvas width & height
        const cWidth = this.canvas.offsetWidth, cHeight = this.canvas.offsetHeight;
        this.canvas.width = cWidth;
        this.canvas.height = cHeight;
        // Clip image (if necessary)
        let [clipWidth, clipHeight, marginX, marginY] = FitImage(this.preview.naturalWidth, this.preview.naturalHeight, this.canvas);
        // Draw the canvas
        ctx.clearRect(0, 0, cWidth, cHeight);
        ctx.drawImage(this.preview, marginX, marginY, clipWidth, clipHeight);
    }
    // CONSTRUCTOR: make HTML elements & apply event listeners
    constructor(parent, album) {
        // SELECTION LOGIC: update elment when selected by user    
        this.selected = false;
        this.album = album;
        this.parent = parent;
        // HTML ELEMENTS
        // 1. main container
        this.container = document.createElement("li");
        this.container.classList.add("album-item");
        this.parent.albumList.appendChild(this.container);
        // 2. album title
        const title = document.createElement("h3");
        title.innerText = album.title;
        this.container.appendChild(title);
        // 3. album description
        const description = document.createElement("p");
        description.innerText = album.description;
        this.container.appendChild(description);
        // 4. album preview image (as canvas)
        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);
        this.preview = new Image();
        this.preview.src = album.cover;
        this.DrawPreview();
        // 5. select button
        this.selectButton = document.createElement("button");
        this.container.appendChild(this.selectButton);
        // EVENT LISTENERS
        // 1. Update elements when selection changes
        this.container.addEventListener("click", () => {
            this.parent.UpdateSelection(this.album.index);
        });
        // 2. Redraw preview whenever window is resized
        window.addEventListener("resize", () => this.DrawPreview());
        // OPTIONAL BUTTONS, ONLY GENERATED FOR CUSTOM ALBUMS
        if (!album.base) {
            const buttonContainer = document.createElement("nav");
            buttonContainer.classList.add("album-line-nav");
            this.container.appendChild(buttonContainer);
            // 1a. Button to edit album
            const editButton = document.createElement("a");
            const editImage = new Image();
            editImage.src = "assets/edit.svg";
            editButton.appendChild(editImage);
            editButton.classList.add("edit-album-button");
            buttonContainer.appendChild(editButton);
            // 1b. Event listener: logic handled in parent
            editButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.parent.EditAlbum(this.album);
            });
            // 2a. Button to delete album
            const deleteButton = document.createElement("a");
            const deleteImage = new Image();
            deleteImage.src = "assets/delete.svg";
            deleteButton.appendChild(deleteImage);
            deleteButton.classList.add("delete-album-button");
            buttonContainer.appendChild(deleteButton);
            // 2b. Event listener: logic handled in parent
            deleteButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.parent.DeleteAlbum(this.album);
            });
        }
    }
}
