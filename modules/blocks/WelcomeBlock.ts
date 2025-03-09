import Mangerie from "../Mangerie.js";
import PhadeBlock from "./PhadeBlock.js";
import { GameState, PhadePhase } from "../Enums.js";

// WELCOME BLOCK: SHORT INTRO WHEN GAME IS LOADED
export default class WelcomeBlock extends PhadeBlock {
    // CONSTRUCTOR
    constructor(mangerie: Mangerie){
        const welcome = document.getElementById("welcome-text")!;
        super(mangerie, welcome);

        // OVERWRITE ANIMATION PROPERTIES
        this.durationIn = 300;
        this.durationOut = 1000;

        // EXIT ON CLICK
        welcome.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;

            const disable = this.Disable.bind(this);
            disable();
            
            this.mangerie.SetState(GameState.Menu);
        });
    }
}