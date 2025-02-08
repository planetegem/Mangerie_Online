import { GameState, PhadePhase } from "../../Enums.js";
import PhadeBlock from "../PhadeBlock.js";
import AlbumItem from "./AlbumItem.js";
export default class AlbumPickerBlock extends PhadeBlock {
    // OVERRIDE ENABLE METHOD: ADD LOGIC TO CREATE ALBUM ITEMS
    Enable() {
        super.Enable();
        while (this.albumList.firstChild) {
            this.albumList.removeChild(this.albumList.firstChild);
        }
        this.albums = [];
        this.mangerie.Albums.forEach((album) => {
            const albumLi = new AlbumItem(this, album);
            this.albums.push(albumLi);
        });
        this.UpdateSelection();
        this.albumList.appendChild(this.createNewAlbum);
    }
    // UPDATE SELECTION
    UpdateSelection(index = this.mangerie.albumIndex) {
        this.mangerie.albumIndex = index;
        this.albums.forEach(album => {
            album.SetSelected(index);
        });
    }
    // CONSTRUCTOR: SET EVENT LISTENERS
    constructor(mangerie) {
        const element = document.getElementById("album-selector");
        super(mangerie, element);
        // HTML Elements
        this.exitSelector = document.getElementById("exit-album-selector");
        this.exitButton = document.getElementById("exit-album-button");
        this.albumList = document.getElementById("album-list");
        this.createNewAlbum = document.getElementById("create-new-album");
        // ALBUM ITEMS
        this.albums = [];
        this.durationIn = 350;
        this.durationOut = 350;
        this.exitSelector.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            const disable = this.Disable.bind(this);
            disable();
            this.mangerie.SetState(GameState.Menu);
        });
        this.exitButton.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            const disable = this.Disable.bind(this);
            disable();
            this.mangerie.SetState(GameState.Menu);
        });
    }
    // MAIN UPDATE FUNCTION
    Update(delta) {
        const fader = this.Fade.bind(this);
        return fader(delta);
    }
}
