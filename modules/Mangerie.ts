import { AssetMap, AssetArray, soundLibrary, imageLibrary } from "./Assets.js";
import GameBlock from "./blocks/GameBlock.js";
import LoadingBlock from "./blocks/LoadingBlock.js";
import WelcomeBlock from "./blocks/WelcomeBlock.js";
import MenuBlock from "./blocks/MenuBlock.js";
import { GameState, PhadePhase } from "./Enums.js";
import { Block, IAlbum } from "./Interfaces.js";
import TutorialBlock from "./blocks/TutorialBlock.js";
import InfoBlock from "./blocks/InfoBlock.js";
import AlbumPickerBlock from "./blocks/album/AlbumPickerBlock.js";
import { getJSON } from "./Helpers.js";
import PhotoAlbum from "./blocks/album/PhotoAlbum.js";
import TitlecardBlock from "./blocks/TitlecardBlock.js";




export default class Mangerie {
    // FUNCTIONAL PROPERTIES
    private time: number = Date.now();
    private frame: number = 0;

    // STATE MANAGEMENT PROPERTIES
    public loading: boolean = true;
    public state: GameState = GameState.Loading;
    public former: GameState = GameState.Welcome;
    private previousBlock: Block | null;
    private currentBlock: Block;

    // ASSETS
    public readonly sounds: AssetMap<HTMLAudioElement>;
    public readonly assets: AssetArray<HTMLImageElement>;

    // PHOTO ALBUMS
    private albums: PhotoAlbum[] = [];
    set Albums(albums: PhotoAlbum[]){ this.albums = albums; }
    get Albums(): PhotoAlbum[] {return this.albums}
    public albumIndex: number = 0;
    get CurrentAlbum(): PhotoAlbum {
        return this.albums[this.albumIndex];
    }
    
    // MAIN COMPONENTS
    private loader: LoadingBlock;
    private welcome: WelcomeBlock;
    private menu: MenuBlock;
    private kaleidoscope: GameBlock;
    private tutorial: TutorialBlock;
    private info: InfoBlock;
    private albumSelector: AlbumPickerBlock;
    private titlecard: TitlecardBlock;

    // CONSTRUCTOR: SET ASSETS, INITIALIZE COMPONENTS, START LOADING PROCESS
    public constructor(){
        // Set assets
        this.sounds = new AssetMap(soundLibrary);
        this.assets = new AssetArray(imageLibrary);

        // Set components for menu
        this.loader = new LoadingBlock(this);
        this.welcome = new WelcomeBlock(this);
        this.menu = new MenuBlock(this);
        this.info = new InfoBlock(this);
        this.albumSelector = new AlbumPickerBlock(this);
        this.titlecard = new TitlecardBlock(this);

        // Set components for kaleidoscope
        const kaleidoscopeContainer = document.getElementById("kaleidoscope-container")!;
        this.kaleidoscope = new GameBlock(this, kaleidoscopeContainer);
        this.tutorial = new TutorialBlock(this);

        // Set start position
        this.loader.Enable(true);
        this.currentBlock = this.loader;
        this.previousBlock = null;

        // Start the loop
        this.frame = requestAnimationFrame(this.Loop.bind(this));
    }

    public SetState(state: GameState){
        this.previousBlock = this.currentBlock;
        this.state = state;

        switch (state){
            case GameState.Loading:
                this.currentBlock = this.loader;
                this.currentBlock.Enable(true);
                break;
            
            case GameState.Welcome:
                this.currentBlock = this.welcome;
                this.currentBlock.Enable();
                break;

            case GameState.Menu:
                this.currentBlock = this.menu;

                if (this.previousBlock === this.kaleidoscope) {
                    this.currentBlock.Enable(true);
                    break;
                }
                if (this.previousBlock !== this.info || this.previousBlock !== this.albumSelector) 
                    this.currentBlock.Enable();
                break;

            case GameState.Info:
                this.currentBlock = this.info;
                this.currentBlock.Enable();
                break;

            case GameState.Album:
                this.currentBlock = this.albumSelector;
                this.currentBlock.Enable();
                break;
            
            case GameState.StartGame:
                this.currentBlock = this.kaleidoscope;
                this.kaleidoscope.PictureBook = this.CurrentAlbum.content;
                this.kaleidoscope.Enable();
                this.state = GameState.Playing;
                break;
            
            case GameState.Tutorial:
                this.currentBlock = this.tutorial;
                this.tutorial.Reset();
                this.tutorial.Enable();
                break;

            case GameState.Playing:
                this.currentBlock = this.kaleidoscope;
                break;

            case GameState.Titlecard:
                this.currentBlock = this.titlecard;
                this.titlecard.Enable();
                this.titlecard.Title = this.CurrentAlbum.title;
                break;
            
        }
    }

    private Loop(){
        let delta: number = Date.now() - this.time;
        this.time = Date.now();

        if (this.previousBlock != null){
            if (this.previousBlock.Update(delta) === PhadePhase.Done){
                this.previousBlock = null;
            }
        }
        this.currentBlock.Update(delta);
        
        this.frame = requestAnimationFrame(this.Loop.bind(this));
    }
}