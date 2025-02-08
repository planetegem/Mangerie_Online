import { GameState, PhadePhase } from "../../Enums.js";
import { Block } from "../../Interfaces.js";
import Mangerie from "../../Mangerie.js";
import PhadeBlock from "../PhadeBlock.js";
import AlbumItem from "./AlbumItem.js";

export default class AlbumPickerBlock extends PhadeBlock implements Block {
    // HTML Elements
    private exitSelector: HTMLElement = document.getElementById("exit-album-selector")!;
    private exitButton: HTMLElement = document.getElementById("exit-album-button")!;
    public readonly albumList: HTMLElement = document.getElementById("album-list")!;
    private createNewAlbum: HTMLElement = document.getElementById("create-new-album")!;

    // ALBUM ITEMS
    private albums: AlbumItem[] = [];

    // OVERRIDE ENABLE METHOD: ADD LOGIC TO CREATE ALBUM ITEMS
    public Enable(): void {
        super.Enable();
        while (this.albumList.firstChild) {
            this.albumList.removeChild(this.albumList.firstChild);
        }
        this.albums = [];
        this.mangerie.Albums.forEach((album) => {
            const albumLi: AlbumItem = new AlbumItem(this, album);
            this.albums.push(albumLi);
        });
        this.UpdateSelection();
        this.albumList.appendChild(this.createNewAlbum);
    }

    // UPDATE SELECTION
    public UpdateSelection(index: number = this.mangerie.albumIndex){
        this.mangerie.albumIndex = index;

        this.albums.forEach(album => {
            album.SetSelected(index);
        });
    }

    // CONSTRUCTOR: SET EVENT LISTENERS
    constructor(mangerie: Mangerie){
        const element: HTMLElement = document.getElementById("album-selector")!;
        super(mangerie, element);
        this.durationIn = 350;
        this.durationOut = 350;
    
        this.exitSelector.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;
        
            const disable = this.Disable.bind(this);
            disable();
            this.mangerie.SetState(GameState.Menu);
        });

        this.exitButton.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;
        
            const disable = this.Disable.bind(this);
            disable();
            this.mangerie.SetState(GameState.Menu);
        });
    }

    // MAIN UPDATE FUNCTION
    public Update(delta: number): PhadePhase {
        const fader = this.Fade.bind(this);
        return fader(delta);
    }
}