import Mangerie from "../Mangerie.js";
import { Block } from "../Interfaces.js";
import PhadeBlock from "./PhadeBlock.js";
import { PhadePhase } from "../Enums.js";

// LOADING WIDGET: ROTATES UNTIL GAME SIGNALS THAT LOADING IS COMPLETE
export default class LoadingBlock extends PhadeBlock implements Block {
    // ANIMATION PROPERTIES
    private minimumLoadTime: number = 750;
    private rotationFactor: number = 0.4;
    private loadtime: number = 0;

    // CONSTRUCTOR
    constructor(mangerie: Mangerie, container: HTMLElement){
        const widget = document.getElementById("loader-widget") ?? document.createElement("error-loader-widget");
        container.appendChild(widget);
        super(mangerie, container, widget);

        this.durationIn = 100;
        this.durationOut = 200;
    }

    // UPDATE FUNCTION: CHANGE STATE WHEN GAME HAS FINISHED LOADING
    public Update(delta: number): PhadePhase {
        this.loadtime += delta;

        if (!this.mangerie.loading && (this.loadtime >= this.minimumLoadTime) && this.phase === PhadePhase.Hold){
            this.Disable();
            this.mangerie.SetState(this.mangerie.former);
        }
        this.mainElement.style.transform = "rotate(" + this.loadtime*this.rotationFactor + "deg)";
        const fader = this.Fade.bind(this);

        return fader(delta);
    }
}