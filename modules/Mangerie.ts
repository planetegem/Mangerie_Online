import { AssetMap, AssetArray, soundLibrary, imageLibrary } from "./Assets.js";
import GameBlock from "./blocks/GameBlock.js";
import LoadingBlock from "./blocks/LoadingBlock.js";
import WelcomeBlock from "./blocks/WelcomeBlock.js";
import MenuBlock from "./blocks/MenuBlock.js";
import { GameState, PhadePhase } from "./Enums.js";
import { Block } from "./Interfaces.js";
import TutorialBlock from "./blocks/TutorialBlock.js";
import InfoBlock from "./blocks/InfoBlock.js";
import PhotoAlbum from "./blocks/album/PhotoAlbum.js";
import TitlecardBlock from "./blocks/TitlecardBlock.js";
import AlbumManagerBlock from "./blocks/album/AlbumManagerBlock.js";




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
    private albumManager: AlbumManagerBlock;
    private titlecard: TitlecardBlock;

    // CONSTRUCTOR: SET ASSETS, INITIALIZE COMPONENTS, START LOADING PROCESS
    public constructor(){
        // Set assets
        this.sounds = new AssetMap(soundLibrary);
        this.assets = new AssetArray(imageLibrary);

        // Set components
        this.loader = new LoadingBlock(this);
        this.welcome = new WelcomeBlock(this);
        this.menu = new MenuBlock(this);
        this.info = new InfoBlock(this);
        this.titlecard = new TitlecardBlock(this);
        this.kaleidoscope = new GameBlock(this);
        this.tutorial = new TutorialBlock(this);
        this.albumManager = new AlbumManagerBlock(this);

        // Set start position
        this.loader.Enable();
        this.currentBlock = this.loader;
        this.previousBlock = null;

        // Start the loop
        this.frame = requestAnimationFrame(this.Loop.bind(this));
    }

    public SetState(state: GameState){
        this.previousBlock = this.currentBlock;
        this.former = this.state;
        this.state = state;

        switch (state){
            case GameState.Loading:
                this.currentBlock = this.loader;
                break;
            case GameState.Welcome:
                this.currentBlock = this.welcome;
                break;
            case GameState.Menu:
                this.currentBlock = this.menu;
                break;
            case GameState.Info:
                this.currentBlock = this.info;
                break;
            case GameState.AlbumManager:
                this.currentBlock = this.albumManager;
                break;
            case GameState.Tutorial:
                this.currentBlock = this.tutorial;
                break;
            case GameState.Playing:
                this.currentBlock = this.kaleidoscope;
                break;
            case GameState.Titlecard:
                this.currentBlock = this.titlecard;
                break;
        }
        this.currentBlock.Enable();
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