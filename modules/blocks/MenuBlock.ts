import { GameState, PhadePhase } from "../Enums.js";
import Mangerie from "../Mangerie.js";
import { Block } from "../Interfaces.js";
import PhadeBlock from "./PhadeBlock.js";

export default class MenuBlock extends PhadeBlock implements Block {
    
    // STATE MEMORY
    private startingGame: boolean = false;
    private fading: boolean = true;

    // MENU BUTTONS
    private start: HTMLElement = document.getElementById("start-button")!;
    private album: HTMLElement = document.getElementById("album-button")!;
    private info: HTMLElement = document.getElementById("info-button")!;
    private logoDeco: HTMLElement = document.getElementById("online-deco")!;
    private buttonContainer: HTMLElement = document.getElementById("menu-buttons")!;

    // TIMINGS
    private logoFade: number = 1500;
    private buttonsDelay: number = 1500;
    private buttonsFade: number = 1000;

    constructor(mangerie: Mangerie){
        const menu = document.getElementById("main-menu")!;
        super(mangerie, menu, menu);

        this.durationIn = 1000;
        this.durationOut = 1000;

        this.logoDeco.style.animationDuration = (this.logoFade/1000) + "s";

        // BUTTON EVENT LISTENERS
        this.start.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;

            const disable = this.Disable.bind(this);
            disable(true);
            this.startingGame = true;
        });
        this.album.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;
            this.mangerie.SetState(GameState.Album);
        });
        this.info.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;
            this.mangerie.SetState(GameState.Info);
        });
    }

    public Update(delta: number): number {
        const fader = this.Fade.bind(this);
        const state: PhadePhase = fader(delta);

        switch(state){
            case PhadePhase.Hold:
                this.logoDeco.classList.add("start-fade");

                if (this.fading){
                    if (this.runtime >= this.logoFade + this.buttonsDelay + this.buttonsFade){
                        this.buttonContainer.style.opacity = "1";
                        this.fading = false;
                    } else if (this.runtime >= this.logoFade + this.buttonsDelay){
                        this.buttonContainer.style.opacity = ((this.runtime - (this.logoFade + this.buttonsDelay)) / this.buttonsFade).toString();
                    }
                }
                break;
            case PhadePhase.Done:
                this.logoDeco.classList.remove("start-fade");
                this.fading = true;
                this.buttonContainer.style.opacity = "0";
                if (this.startingGame){
                    this.startingGame = false;
                    this.mangerie.SetState(GameState.Titlecard);
                }
        }    
        return state;  
    }
}