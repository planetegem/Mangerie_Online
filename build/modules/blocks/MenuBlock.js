import { GameState, PhadePhase } from "../Enums.js";
import PhadeBlock from "./PhadeBlock.js";
export default class MenuBlock extends PhadeBlock {
    // OVERRIDE ENABLE AND DISABLE METHODS (FOR STATE SWITCHING WITHOUT REAL DISABLE)
    Disable() {
        this.enabled = false;
        super.Disable();
    }
    Enable() {
        if (!this.enabled)
            super.Enable();
    }
    // CONSTRUCTOR: ADD EVENT LISTENERS
    constructor(mangerie) {
        const menu = document.getElementById("main-menu");
        super(mangerie, menu);
        // STATE MEMORY
        this.startingGame = false;
        this.fading = true;
        this.enabled = false;
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
            disable();
            this.startingGame = true;
        });
        this.album.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.mangerie.SetState(GameState.AlbumSelection);
        });
        this.info.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.mangerie.SetState(GameState.Info);
        });
    }
    // MAIN UPDATE FUNCTION: ANIMATE LOGO
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
