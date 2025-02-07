import { GameState, PhadePhase } from "../Enums.js";
import PhadeBlock from "./PhadeBlock.js";
export default class InfoBlock extends PhadeBlock {
    constructor(mangerie) {
        const element = document.getElementById("info-text");
        super(mangerie, element, element);
        // HTML Elements
        this.closeButton = document.getElementById("exit-info");
        this.closeButton2 = document.getElementById("exit-info-button");
        this.durationIn = 350;
        this.durationOut = 350;
        this.closeButton.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            const disable = this.Disable.bind(this);
            disable();
            this.mangerie.SetState(GameState.Menu);
        });
        this.closeButton2.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            const disable = this.Disable.bind(this);
            disable();
            this.mangerie.SetState(GameState.Menu);
        });
    }
    Update(delta) {
        const fader = this.Fade.bind(this);
        return fader(delta);
    }
}
