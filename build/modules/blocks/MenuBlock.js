import { GameState, PhadePhase } from "../Enums.js";
import PhadeBlock from "./PhadeBlock.js";
export default class MenuBlock extends PhadeBlock {
    constructor(mangerie) {
        const menu = document.getElementById("main-menu");
        super(mangerie, menu, menu);
        // STATE MEMORY
        this.startingGame = false;
        this.fading = true;
        // MENU BUTTONS
        this.start = document.getElementById("start-button");
        this.album = document.getElementById("album-button");
        this.info = document.getElementById("info-button");
        this.logoDeco = document.getElementById("online-deco");
        this.buttonContainer = document.getElementById("menu-buttons");
        // TIMINGS
        this.logoFade = 1500;
        this.buttonsDelay = 1500;
        this.buttonsFade = 1000;
        this.durationIn = 1000;
        this.durationOut = 1000;
        this.logoDeco.style.animationDuration = (this.logoFade / 1000) + "s";
        // BUTTON EVENT LISTENERS
        this.start.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            const disable = this.Disable.bind(this);
            disable(true);
            this.startingGame = true;
        });
        this.album.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.mangerie.SetState(GameState.Album);
        });
        this.info.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.mangerie.SetState(GameState.Info);
        });
    }
    Update(delta) {
        const fader = this.Fade.bind(this);
        const state = fader(delta);
        switch (state) {
            case PhadePhase.Hold:
                this.logoDeco.classList.add("start-fade");
                if (this.fading) {
                    if (this.runtime >= this.logoFade + this.buttonsDelay + this.buttonsFade) {
                        this.buttonContainer.style.opacity = "1";
                        this.fading = false;
                    }
                    else if (this.runtime >= this.logoFade + this.buttonsDelay) {
                        this.buttonContainer.style.opacity = ((this.runtime - (this.logoFade + this.buttonsDelay)) / this.buttonsFade).toString();
                    }
                }
                break;
            case PhadePhase.Done:
                this.logoDeco.classList.remove("start-fade");
                this.fading = true;
                this.buttonContainer.style.opacity = "0";
                if (this.startingGame) {
                    this.startingGame = false;
                    this.mangerie.SetState(GameState.Titlecard);
                }
        }
        return state;
    }
}
