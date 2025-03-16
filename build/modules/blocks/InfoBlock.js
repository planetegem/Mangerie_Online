import { GameState, PhadePhase } from "../Enums.js";
import PhadeBlock from "./PhadeBlock.js";
export default class InfoBlock extends PhadeBlock {
    PlayExitSound() {
        this.exitSound.currentTime = 0;
        this.exitSound.play();
    }
    constructor(mangerie) {
        const element = document.getElementById("info-text");
        super(mangerie, element);
        // HTML Elements
        this.closeButton = document.getElementById("exit-info");
        this.closeButton2 = document.getElementById("exit-info-button");
        this.durationIn = 350;
        this.durationOut = 350;
        this.closeButton.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.PlayExitSound();
            this.Disable();
            this.mangerie.SetState(GameState.Menu);
        });
        this.closeButton2.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            this.PlayExitSound();
            this.Disable();
            this.mangerie.SetState(GameState.Menu);
        });
        this.exitSound = mangerie.sounds.content.get("bowl").object;
    }
}
