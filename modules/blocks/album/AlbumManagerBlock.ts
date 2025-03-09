import { GameState, PhadePhase } from "../../Enums.js";
import { Block, IAlbum } from "../../Interfaces.js";
import Mangerie from "../../Mangerie.js";
import PhadeBlock from "../PhadeBlock.js";
import AlbumCreatorBlock from "./AlbumCreatorBlock.js";
import AlbumPickerBlock from "./AlbumPickerBlock.js";
import PhotoAlbum from "./PhotoAlbum.js";

// ALBUM MANAGER
// Switches between album creation and selection
// Also holds logic to save albums to localStorage

export default class AlbumManagerBlock extends PhadeBlock {
    // COMPONENTS
    private albumPicker: AlbumPickerBlock;
    private albumCreator: AlbumCreatorBlock;

    // STATE PROPS
    private enabled: boolean = false;

    // SWITCH BETWEEN COMPONENTS
    private currentBlock: Block;
    private switching: boolean = true;
    public set Block(block: Block) {
        this.switching = true;
        this.currentBlock.Disable();
        this.currentBlock = block;
    }

    // SWITCH TO ALBUM CREATOR (TO EDIT EXISTING)
    public OpenAlbumEditor(album: PhotoAlbum): void {
        this.Block = this.albumCreator;
        this.albumCreator.PrepareAlbum(album, false);
    }

    // SAVE ALBUMS TO LOCAL STORAGE
    public SaveToStorage(): void {
        let preparedAlbums: IAlbum[] = []
        this.mangerie.Albums.forEach(album => {
            if (!album.base) preparedAlbums.push({title: album.title, description: album.description, cover: "", images: album.content});
        });
        localStorage.setItem("createdAlbums", JSON.stringify(preparedAlbums));
    
        this.Block = this.albumPicker;
        this.mangerie.SetState(GameState.Loading);
    }

    // CONSTRUCTOR: SET EVENT LISTENERS
    constructor(mangerie: Mangerie){
        const container: HTMLElement = document.getElementById("album-manager")!;
        super(mangerie, container);

        this.albumPicker = new AlbumPickerBlock(mangerie, this);
        this.albumCreator = new AlbumCreatorBlock(mangerie);
        this.currentBlock = this.albumPicker;

        // EVENT LISTENERS
        // 0. Gather elements
        const exitToMenu: HTMLElement = document.getElementById("exit-to-menu")!;
        const confirmToMenu: HTMLElement = document.getElementById("confirm-to-menu")!;
        const createNewAlbum: HTMLElement = document.getElementById("create-new-album")!;
        const exitAlbumCreator: HTMLElement = document.getElementById("exit-album-creator")!;
        const cancelAlbumCreation: HTMLElement = document.getElementById("cancel-album-creation")!;
        const confirmAlbumCreation: HTMLElement = document.getElementById("confirm-album-creation")!;

        // 1. return to menu from album picker
        exitToMenu.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;
                    
            this.Disable();
            this.mangerie.SetState(GameState.Menu);
        });
        confirmToMenu.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;
                    
            this.Disable();
            this.mangerie.SetState(GameState.Menu);
        });

        // 2. Switch to album creator
        createNewAlbum.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;

            this.Block = this.albumCreator;
            this.albumCreator.PrepareAlbum();
        });

        // 3. exit album creator (to album picker) 
        exitAlbumCreator.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;
            this.Block = this.albumPicker;
        });
        cancelAlbumCreation.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;
            this.Block = this.albumPicker;
        });

        // 4. confirm album creation
        confirmAlbumCreation.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;

            let tryAlbum: boolean = this.albumCreator.CreateAlbum();
            if (tryAlbum){
                let [album, newAlbum] = this.albumCreator.RetrieveAlbum();
                if (newAlbum){
                    album.index = this.mangerie.Albums.length;
                    this.mangerie.Albums.push(album);
                }
                this.SaveToStorage();
            }
        });
    }

    // OVERRIDE ENABLE: if already enabled, return early + set albumPicker as active block
    public Enable(): void{
        this.switching = true;
        this.currentBlock = this.albumPicker;

        if (this.enabled) return;
        this.enabled = true;
        super.Enable();
    }
    public Disable(): void {
        this.enabled = false;
        this.currentBlock.Disable();
        super.Disable();
    }

    // MAIN UPDATE FUNCTION
    public Update(delta: number): PhadePhase {
        super.Update(delta);

        if (this.phase === PhadePhase.Hold && this.switching){
            this.currentBlock.Enable();
            this.switching = false;
        }

        this.albumCreator.Update(delta);
        this.albumPicker.Update(delta);

        return this.phase;
    }
}