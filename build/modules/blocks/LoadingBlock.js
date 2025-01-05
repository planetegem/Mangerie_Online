import PhadeBlock from "./PhadeBlock.js";
import { PhadePhase } from "../Enums.js";
// LOADING WIDGET: ROTATES UNTIL GAME SIGNALS THAT LOADING IS COMPLETE
export default class LoadingBlock extends PhadeBlock {
    // CONSTRUCTOR
    constructor(mangerie, container) {
        var _a;
        const widget = (_a = document.getElementById("loader-widget")) !== null && _a !== void 0 ? _a : document.createElement("error-loader-widget");
        container.appendChild(widget);
        super(mangerie, container, widget);
        // ANIMATION PROPERTIES
        this.minimumLoadTime = 750;
        this.rotationFactor = 0.4;
        this.loadtime = 0;
        this.durationIn = 100;
        this.durationOut = 200;
    }
    // UPDATE FUNCTION: CHANGE STATE WHEN GAME HAS FINISHED LOADING
    Update(delta) {
        this.loadtime += delta;
        if (!this.mangerie.loading && (this.loadtime >= this.minimumLoadTime) && this.phase === PhadePhase.Hold) {
            this.Disable();
            this.mangerie.SetState(this.mangerie.former);
        }
        this.mainElement.style.transform = "rotate(" + this.loadtime * this.rotationFactor + "deg)";
        const fader = this.Fade.bind(this);
        return fader(delta);
    }
}
