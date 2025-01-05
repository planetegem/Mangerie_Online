import { GameState, PhadePhase } from "../Enums.js";
import Mangerie from "../Mangerie.js";
import { Block } from "../Interfaces.js";
import PhadeBlock from "./PhadeBlock.js";

export default class MenuBlock extends PhadeBlock implements Block {
   
    // MENU BUTTONS
    private start: HTMLElement = document.getElementById("start-button") ?? document.createElement("start-error");
    private album: HTMLElement = document.getElementById("album-button") ?? document.createElement("album-error");
    private info: HTMLElement = document.getElementById("info-button") ?? document.createElement("info-error");

    constructor(mangerie: Mangerie, container: HTMLElement){
        const menu = document.getElementById("main-menu") ?? document.createElement("menu-error");
        container.appendChild(menu);
        super(mangerie, container, menu);

        this.durationIn = 1000;
        this.durationOut = 1000;

        // BUTTON EVENT LISTENERS
        this.start.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;

            const disable = this.Disable.bind(this);
            disable(true);

            this.mangerie.SetState(GameState.Starting);
        });
        this.album.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;

        });
        menu.appendChild(this.album);
        this.info.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;

        });
        menu.appendChild(this.info);
    }

    public Update(delta: number): number {
        const fader = this.Fade.bind(this);
        return fader(delta);  
    }








}