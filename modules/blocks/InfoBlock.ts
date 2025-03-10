import { GameState, PhadePhase } from "../Enums.js";
import Mangerie from "../Mangerie.js";
import PhadeBlock from "./PhadeBlock.js";

export default class InfoBlock extends PhadeBlock {
    // HTML Elements
    private closeButton: HTMLElement = document.getElementById("exit-info")!;
    private closeButton2: HTMLElement = document.getElementById("exit-info-button")!;

    constructor(mangerie: Mangerie){
        const element: HTMLElement = document.getElementById("info-text")!;
        super(mangerie, element);
        this.durationIn = 350;
        this.durationOut = 350;

        this.closeButton.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;

            const disable = this.Disable.bind(this);
            disable();
            this.mangerie.SetState(GameState.Menu);
        });
        this.closeButton2.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;

            const disable = this.Disable.bind(this);
            disable();
            this.mangerie.SetState(GameState.Menu);
        });
    }
}