import { PhadePhase } from "../Enums.js";
export default class PhadeBlock {
    // CONSTRUCTOR
    constructor(mangerie, elem) {
        // ANIMATION PROPS
        this.phase = PhadePhase.Hold;
        this.runtime = 0;
        this.durationIn = 500;
        this.durationOut = 500;
        this.disableContainer = false;
        this.enableContainer = false;
        this.mangerie = mangerie;
        this.mainElement = elem;
        this.mainElement.style.display = "none";
    }
    // FADE LOGIC: FADE IN AND OUT OF EXISTENCE
    Update(delta) {
        this.runtime += delta;
        switch (this.phase) {
            // Fading in
            case PhadePhase.In:
                if (this.runtime >= this.durationIn) {
                    this.mainElement.style.opacity = "1";
                    this.phase = PhadePhase.Hold;
                }
                else {
                    this.mainElement.style.opacity = (this.runtime / this.durationIn).toString();
                }
                break;
            // Fading out
            case PhadePhase.Out:
                if (this.runtime > this.durationOut) {
                    this.phase = PhadePhase.Done;
                    this.mainElement.style.display = "none";
                    this.runtime = 0;
                }
                else {
                    this.mainElement.style.opacity = (1 - this.runtime / this.durationOut).toString();
                }
                break;
        }
        return this.phase;
    }
    // ENABLE THE COMPONENT
    Enable() {
        this.mainElement.style.display = "flex";
        this.runtime = 0;
        this.phase = PhadePhase.In;
    }
    // DISABLE THE COMPONENT
    Disable() {
        this.runtime = 0;
        this.phase = PhadePhase.Out;
    }
}
