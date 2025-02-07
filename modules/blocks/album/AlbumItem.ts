import Mangerie from "../../Mangerie.js";
import AlbumPickerBlock from "./AlbumPickerBlock.js";
import PhotoAlbum from "./PhotoAlbum.js";

export default class AlbumItem {
    private album: PhotoAlbum;
    private parent: AlbumPickerBlock;
    private selectButton: HTMLElement;
    private selected: boolean = false;
    private container: HTMLElement;

    public SetSelected(index: number){
        this.selected = (this.album.index === index);
        this.selectButton.innerText = (this.selected) ? "selected" : "select";
        if (this.selected){
            this.container.classList.add("selected");
        } else {
            this.container.classList.remove("selected");
        }
    }

    constructor(parent: AlbumPickerBlock, album: PhotoAlbum){
        this.album = album;
        this.parent = parent;

        this.container = document.createElement("li");
        this.container.classList.add("album-item");
        this.parent.albumList.appendChild(this.container);

        const title: HTMLElement = document.createElement("h3");
        title.innerText = album.title;
        this.container.appendChild(title);

        const description: HTMLElement = document.createElement("p");
        description.innerText = album.description;
        this.container.appendChild(description);

        const cover: HTMLImageElement = document.createElement("img");
        cover.src = album.cover;
        this.container.appendChild(cover);

        this.selectButton = document.createElement("button");
        this.container.appendChild(this.selectButton);

        this.container.addEventListener("click", () => {
            this.parent.UpdateSelection(this.album.index);
        });
    }
}