import { FitImage } from "../../Helpers.js";
import Mangerie from "../../Mangerie.js";
import PhadeBlock from "../PhadeBlock.js";
import AlbumManagerBlock from "./AlbumManagerBlock.js";
import PhotoAlbum from "./PhotoAlbum.js";

// ALBUM PICKER
// Load photo albums as selectable items
export default class AlbumPickerBlock extends PhadeBlock {

    // Manager element: needed when removing and editing albums
    private manager: AlbumManagerBlock;

    // HTML Elements
    public readonly albumList: HTMLElement = document.getElementById("album-list")!;
    private createNewAlbum: HTMLElement = document.getElementById("create-new-album")!;

    // ALBUM ITEMS
    private albums: AlbumPickerLine[] = [];

    // OVERRIDE ENABLE METHOD: ADD LOGIC TO CREATE ALBUM ITEMS
    public Enable(): void {
        super.Enable();
        while (this.albumList.firstChild) {
            this.albumList.removeChild(this.albumList.firstChild);
        }
        this.albums = [];
        this.mangerie.Albums.forEach((album) => {
            const albumLi: AlbumPickerLine = new AlbumPickerLine(this, album);
            this.albums.push(albumLi);
        });
        this.UpdateSelection();
        this.albumList.appendChild(this.createNewAlbum);
    }

    // RETURN TO MANAGER (REQUESTED BY LINE)
    public DeleteAlbum(album: PhotoAlbum): void {
        this.mangerie.Albums.splice(album.index, 1);
        this.manager.SaveToStorage();
    }
    public EditAlbum(album: PhotoAlbum): void {
        this.manager.OpenAlbumEditor(album);
    }

    // UPDATE SELECTION
    public UpdateSelection(index: number = this.mangerie.albumIndex){
        this.mangerie.albumIndex = index;

        this.albums.forEach(album => {
            album.SetSelected(index);
        });
    }

    // CONSTRUCTOR: SET EVENT LISTENERS
    constructor(mangerie: Mangerie, manager: AlbumManagerBlock){
        const selector: HTMLElement = document.getElementById("album-selector")!;
        super(mangerie, selector);
        this.manager = manager;

        this.durationIn = 350;
        this.durationOut = 350;
    }

}

// LINE ELEMENT GENERATED FOR EVERY ALBUM FOUND
class AlbumPickerLine {

    // MAIN PROPS
    private album: PhotoAlbum;
    private parent: AlbumPickerBlock;
    private container: HTMLElement;

    // SELECTION LOGIC: update elment when selected by user    
    private selected: boolean = false;
    private selectButton: HTMLElement;

    public SetSelected(index: number){
        this.selected = (this.album.index === index);
        this.selectButton.innerText = (this.selected) ? "selected" : "select";
        if (this.selected){
            this.container.classList.add("selected");
        } else {
            this.container.classList.remove("selected");
        }
    }

    // PREVIEW LOGIC: draw image to canves (to apply clip logic)
    private preview: HTMLImageElement;
    private canvas: HTMLCanvasElement;

    private DrawPreview(): void {
        const ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;

        // Normalize canvas width & height
        const cWidth: number = this.canvas.offsetWidth, cHeight: number = this.canvas.offsetHeight;
        this.canvas.width = cWidth;
        this.canvas.height = cHeight;

        // Clip image (if necessary)
        let [clipWidth, clipHeight, marginX, marginY] = FitImage(this.preview.naturalWidth, this.preview.naturalHeight, this.canvas);

        // Draw the canvas
        ctx.clearRect(0, 0, cWidth, cHeight);
        ctx.drawImage(this.preview, marginX, marginY, clipWidth, clipHeight);
    }

    // CONSTRUCTOR: make HTML elements & apply event listeners
    constructor(parent: AlbumPickerBlock, album: PhotoAlbum){
        this.album = album;
        this.parent = parent;

        // HTML ELEMENTS
        // 1. main container
        this.container = document.createElement("li");
        this.container.classList.add("album-item");
        this.parent.albumList.appendChild(this.container);

        // 2. album title
        const title: HTMLElement = document.createElement("h3");
        title.innerText = album.title;
        this.container.appendChild(title);

        // 3. album description
        const description: HTMLElement = document.createElement("p");
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
            const buttonContainer: HTMLElement = document.createElement("nav");
            buttonContainer.classList.add("album-line-nav");
            this.container.appendChild(buttonContainer);

            // 1a. Button to edit album
            const editButton: HTMLElement = document.createElement("a");
            const editImage: HTMLImageElement = new Image();
            editImage.src = "assets/edit.svg";
            editButton.appendChild(editImage);
            editButton.classList.add("edit-album-button");
            buttonContainer.appendChild(editButton);

            // 1b. Event listener: logic handled in parent
            editButton.addEventListener("click", (e) => {
                e.preventDefault(); e.stopPropagation();

                this.parent.EditAlbum(this.album);
            });
            
            // 2a. Button to delete album
            const deleteButton: HTMLElement = document.createElement("a");
            const deleteImage: HTMLImageElement = new Image();
            deleteImage.src = "assets/delete.svg";
            deleteButton.appendChild(deleteImage);
            deleteButton.classList.add("delete-album-button");
            buttonContainer.appendChild(deleteButton);

            // 2b. Event listener: logic handled in parent
            deleteButton.addEventListener("click", (e) => {
                e.preventDefault(); e.stopPropagation();

                this.parent.DeleteAlbum(this.album);
            });
        }
    }
}