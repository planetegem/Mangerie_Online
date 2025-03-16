import { GameState, PhadePhase } from "../Enums.js";
import Kaleidoscope from "../kaleidoscope/Kaleidoscope.js";
export default class GameBlock extends Kaleidoscope {
    PlayExitSound() {
        this.exitSound.currentTime = 0;
        this.exitSound.play();
    }
    // CONSTRUCTOR
    constructor(mangerie) {
        super(mangerie);
        this.enabled = false;
        // ANIMATION PROPERTIES
        this.phase = PhadePhase.In;
        this.runtime = 0;
        this.startFade = 1000;
        this.holdTime = 1500;
        this.mangerie = mangerie;
        this.container = document.getElementById("kaleidoscope-container");
        this.tutorialRequired = (localStorage.getItem("firstTime") == "true" || localStorage.getItem("firstTime") == null);
        document.getElementById("tutorial-button").addEventListener("click", () => {
            this.mangerie.SetState(GameState.Tutorial);
        });
        document.getElementById("return-button").addEventListener("click", () => {
            this.PlayExitSound();
            this.Disable();
        });
        this.exitSound = mangerie.sounds.content.get("bowl").object;
    }
    // CUSTOM ENABLE FUNCTION TO RESET KALEIDOSCOPE VALUES
    Enable() {
        // If already enabled, return early
        if (this.enabled)
            return;
        this.enabled = true;
        // Fetch current photo album
        this.PictureBook = this.mangerie.CurrentAlbum.content;
        // Set animation props
        this.phase = PhadePhase.In;
        this.runtime = 0;
        // Reset kaleidoscope props
        this.Resize();
        this.interactionAllowed = false;
        this.modules.forEach((module) => {
            module.Reset();
            module.Draw();
        });
        this.switchPlayed = false;
    }
    // CUSTOM DISABLE METHOD
    Disable() {
        this.phase = PhadePhase.Out;
        this.runtime = 0;
        this.enabled = false;
    }
    // MAIN UPDATE FUNCTION
    Update(delta) {
        this.runtime += delta;
        switch (this.phase) {
            case PhadePhase.In:
                if (this.runtime >= this.startFade) {
                    this.ResetKaleidoscope(0);
                    this.phase = PhadePhase.Hold;
                    this.runtime = 0;
                }
                else {
                    this.container.style.opacity = (this.runtime / this.startFade).toString();
                }
                break;
            case PhadePhase.Hold:
                if (this.resetting) {
                    this.ResetAnimation(delta);
                }
                else if (this.tutorialRequired && this.runtime >= this.holdTime) {
                    this.tutorialRequired = false;
                    this.mangerie.SetState(GameState.Tutorial);
                }
                break;
            case PhadePhase.Out:
                if (this.runtime >= this.startFade) {
                    this.mangerie.SetState(GameState.Menu);
                    this.phase = PhadePhase.Done;
                    document.body.style.cursor = "";
                    this.runtime = 0;
                }
                else {
                    this.container.style.opacity = (1 - this.runtime / this.startFade).toString();
                }
                break;
        }
        for (let module of this.modules) {
            module.Draw();
        }
        return this.phase;
    }
}
