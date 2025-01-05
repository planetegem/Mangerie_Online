import { AssetBox, AssetList } from "./assets/AssetBox.js";
import { soundLibrary } from "./assets/SoundBook.js";
import { pictureBook } from "./assets/PictureBook.js";
import GameBlock from "./blocks/GameBlock.js";
import LoadingBlock from "./blocks/LoadingBlock.js";
import WelcomeBlock from "./blocks/WelcomeBlock.js";
import MenuBlock from "./blocks/MenuBlock.js";
import { GameState, PhadePhase } from "./Enums.js";
import { Block } from "./Interfaces.js";
import TutorialBlock from "./blocks/TutorialBlock.js";


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
    public readonly sounds: AssetBox<HTMLAudioElement>;
    public readonly pictures: AssetList<HTMLImageElement>;
    
    // MAIN COMPONENTS
    private loader: LoadingBlock;
    private welcome: WelcomeBlock;
    private menu: MenuBlock;
    private kaleidoscope: GameBlock;
    private tutorial: TutorialBlock;

    public constructor(){
        // Set assets
        this.sounds = new AssetBox(soundLibrary);
        this.pictures = new AssetList(pictureBook);

        // Set components for menu
        const menuContainer = document.getElementById("menu-container") ?? document.createElement("menu-container-missing");
        document.body.appendChild(menuContainer);
       
        this.loader = new LoadingBlock(this, menuContainer);
        this.welcome = new WelcomeBlock(this, menuContainer);
        this.menu = new MenuBlock(this, menuContainer);

        // Set Kaleidoscope
        const kaleidoscopeContainer = document.getElementById("kaleidoscope-container") ?? document.createElement("kaleidoscope-container-missing");
        document.body.appendChild(kaleidoscopeContainer);
        this.kaleidoscope = new GameBlock(this, kaleidoscopeContainer);

        // Create Tutorial
        this.tutorial = new TutorialBlock(this);

        // Load sounds
        const utilityContainer = document.getElementById("utility-box") ?? document.createElement("utility-box-missing");
        document.body.appendChild(utilityContainer);
        for (let [key, sound] of this.sounds.content){
            sound.object.addEventListener("loadstart", () => {
                console.log("Loaded " + sound.src + " at " + Date.now());

                // Then load images
                if (this.sounds.Loaded()){
                    console.log("Loaded all sounds: starting on images");
                    for (let picture of this.pictures.content){
                        picture.object.onload = () => {
                            console.log("Loaded " + picture.src + " at " + Date.now());
                            if (this.pictures.Loaded()){
                                this.loading = false;
                                console.log("Loading complete");
                            }
                        }
                        picture.object.src = picture.src;
                    }
                }
            });
            sound.object.setAttribute("preload", "auto");
            sound.object.setAttribute("controls", "none");
            sound.object.src = sound.src;
            utilityContainer.appendChild(sound.object);
            sound.object.load();
        }

        // Set start position
        this.loader.Enable(true);
        this.currentBlock = this.loader;
        this.previousBlock = null;

        // Start the loop
        this.frame = requestAnimationFrame(this.Loop.bind(this));
    }

    public SetState(state: GameState){
        this.previousBlock = this.currentBlock;

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
                this.currentBlock.Enable();
                break;
            
            case GameState.Complete:
                this.currentBlock = this.kaleidoscope;
                this.kaleidoscope.Enable();
                break;
            
            case GameState.Tutorial:
                this.currentBlock = this.tutorial;
                this.tutorial.Enable();
                break;

            case GameState.Playing:
                this.currentBlock = this.kaleidoscope;
                break;
        }
        this.state = state;
    }

    private Loop(){
        let delta: number = Date.now() - this.time;
        this.time = Date.now();

        if (this.previousBlock != null){
            if (this.previousBlock.Update(delta) === PhadePhase.Done){
                this.previousBlock = null;
            }
        }
        let update = this.currentBlock.Update(delta);

        if (this.state === GameState.Starting && update === PhadePhase.Done){
            let bind = this.SetState.bind(this);
            bind(GameState.Complete);
        }
        if (this.state === GameState.Complete){
            let bind = this.SetState.bind(this);
            bind(GameState.Playing);
        }
        
        this.frame = requestAnimationFrame(this.Loop.bind(this));
    }
}