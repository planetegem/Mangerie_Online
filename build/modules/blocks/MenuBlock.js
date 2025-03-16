import { GameState, PhadePhase } from "../Enums.js";
import PhadeBlock from "./PhadeBlock.js";
export default class MenuBlock extends PhadeBlock {
    PlayOpeningSound() {
        this.openingSound.currentTime = 0;
        this.openingSound.play();
        this.openingSoundPlayed = true;
    }
    PlayWindowSound() {
        this.windowSound.currentTime = 0;
        this.windowSound.play();
        this.windowSoundPlayed = true;
    }
    PlayBowlSound() {
        this.buttonSound.currentTime = 0;
        this.buttonSound.play();
    }
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
        this.openingSoundPlayed = false;
        this.windowSoundPlayed = false;
        // MENU BUTTONS
        this.start = document.getElementById("start-button");
        this.album = document.getElementById("album-button");
        this.info = document.getElementById("info-button");
        this.logoDeco = document.getElementById("online-deco");
        this.buttonContainer = document.getElementById("menu-buttons");
        // TIMINGS
        this.logoFade = 1800;
        this.buttonsDelay = 1500;
        this.buttonsFade = 1000;
        this.durationIn = 1000;
        this.durationOut = 1000;
        this.logoDeco.style.animationDuration = (this.logoFade / 1000) + "s";
        // BUTTON EVENT LISTENERS
        this.start.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.PlayBowlSound();
            this.Disable();
            this.startingGame = true;
        });
        this.album.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.mangerie.SetState(GameState.AlbumManager);
            this.PlayBowlSound();
        });
        this.info.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.mangerie.SetState(GameState.Info);
            this.PlayBowlSound();
        });
        // Set sound effects
        this.openingSound = mangerie.sounds.content.get("wind-up").object;
        this.buttonSound = mangerie.sounds.content.get("bowl2").object;
        this.windowSound = mangerie.sounds.content.get("window").object;
    }
    // MAIN UPDATE FUNCTION: ANIMATE LOGO
    Update(delta) {
        super.Update(delta);
        switch (this.phase) {
            case PhadePhase.Hold:
                this.logoDeco.classList.add("start-fade");
                if (!this.openingSoundPlayed && this.runtime >= this.logoFade - 400) {
                    this.PlayOpeningSound();
                }
                if (this.fading) {
                    if (this.runtime >= this.logoFade + this.buttonsDelay + this.buttonsFade) {
                        this.buttonContainer.style.opacity = "1";
                        this.fading = false;
                    }
                    else if (this.runtime >= this.logoFade + this.buttonsDelay) {
                        if (!this.windowSoundPlayed)
                            this.PlayWindowSound();
                        this.buttonContainer.style.opacity = ((this.runtime - (this.logoFade + this.buttonsDelay)) / this.buttonsFade).toString();
                    }
                }
                break;
            case PhadePhase.Done:
                this.logoDeco.classList.remove("start-fade");
                this.fading = true;
                this.buttonContainer.style.opacity = "0";
                // Reset sound effect
                this.openingSoundPlayed = false;
                this.windowSoundPlayed = false;
                if (this.startingGame) {
                    this.startingGame = false;
                    this.mangerie.SetState(GameState.Titlecard);
                }
        }
        return this.phase;
    }
}
