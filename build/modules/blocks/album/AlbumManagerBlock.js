import { GameState, PhadePhase } from "../../Enums.js";
import PhadeBlock from "../PhadeBlock.js";
import AlbumCreatorBlock from "./AlbumCreatorBlock.js";
import AlbumPickerBlock from "./AlbumPickerBlock.js";
// ALBUM MANAGER
// Switches between album creation and selection
// Also holds logic to save albums to localStorage
export default class AlbumManagerBlock extends PhadeBlock {
    PlayExitSound() {
        this.exitSound.currentTime = 0;
        this.exitSound.play();
    }
    PlayEntrySound() {
        this.entrySound.currentTime = 0;
        this.entrySound.play();
    }
    set Block(block) {
        this.switching = true;
        this.currentBlock.Disable();
        this.currentBlock = block;
    }
    // SWITCH TO ALBUM CREATOR (TO EDIT EXISTING)
    OpenAlbumEditor(album) {
        this.Block = this.albumCreator;
        this.albumCreator.PrepareAlbum(album, false);
        this.PlayEntrySound();
    }
    // SAVE ALBUMS TO LOCAL STORAGE
    SaveToStorage() {
        let preparedAlbums = [];
        this.mangerie.Albums.forEach(album => {
            if (!album.base)
                preparedAlbums.push({ title: album.title, description: album.description, cover: "", images: album.content });
        });
        localStorage.setItem("createdAlbums", JSON.stringify(preparedAlbums));
        this.Block = this.albumPicker;
        this.mangerie.SetState(GameState.Loading);
    }
    // CONSTRUCTOR: SET EVENT LISTENERS
    constructor(mangerie) {
        const container = document.getElementById("album-manager");
        super(mangerie, container);
        // STATE PROPS
        this.enabled = false;
        this.switching = true;
        this.albumPicker = new AlbumPickerBlock(mangerie, this);
        this.albumCreator = new AlbumCreatorBlock(mangerie);
        this.currentBlock = this.albumPicker;
        // EVENT LISTENERS
        // 0. Gather elements
        const exitToMenu = document.getElementById("exit-to-menu");
        const confirmToMenu = document.getElementById("confirm-to-menu");
        const createNewAlbum = document.getElementById("create-new-album");
        const exitAlbumCreator = document.getElementById("exit-album-creator");
        const cancelAlbumCreation = document.getElementById("cancel-album-creation");
        const confirmAlbumCreation = document.getElementById("confirm-album-creation");
        // 1. return to menu from album picker
        exitToMenu.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.PlayExitSound();
            this.Disable();
            this.mangerie.SetState(GameState.Menu);
        });
        confirmToMenu.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.PlayExitSound();
            this.Disable();
            this.mangerie.SetState(GameState.Menu);
        });
        // 2. Switch to album creator
        createNewAlbum.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.PlayEntrySound();
            this.Block = this.albumCreator;
            this.albumCreator.PrepareAlbum();
        });
        // 3. exit album creator (to album picker) 
        exitAlbumCreator.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.PlayExitSound();
            this.Block = this.albumPicker;
        });
        cancelAlbumCreation.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.PlayExitSound();
            this.Block = this.albumPicker;
        });
        // 4. confirm album creation
        confirmAlbumCreation.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            let tryAlbum = this.albumCreator.CreateAlbum();
            if (tryAlbum) {
                let [album, newAlbum] = this.albumCreator.RetrieveAlbum();
                if (newAlbum) {
                    album.index = this.mangerie.Albums.length;
                    this.mangerie.Albums.push(album);
                }
                this.SaveToStorage();
            }
        });
        this.exitSound = mangerie.sounds.content.get("bowl").object;
        this.entrySound = mangerie.sounds.content.get("bowl2").object;
    }
    // OVERRIDE ENABLE: if already enabled, return early + set albumPicker as active block
    Enable() {
        this.switching = true;
        this.currentBlock = this.albumPicker;
        if (this.enabled)
            return;
        this.enabled = true;
        super.Enable();
    }
    Disable() {
        this.enabled = false;
        this.currentBlock.Disable();
        super.Disable();
    }
    // MAIN UPDATE FUNCTION
    Update(delta) {
        super.Update(delta);
        if (this.phase === PhadePhase.Hold && this.switching) {
            this.currentBlock.Enable();
            this.switching = false;
        }
        this.albumCreator.Update(delta);
        this.albumPicker.Update(delta);
        return this.phase;
    }
}
