import { PhadePhase } from "../Enums.js";
export default class PhadeBlock {
    // CONSTRUCTOR
    constructor(mangerie, container, elem) {
        // ANIMATION PROPS
        this.phase = PhadePhase.Hold;
        this.runtime = 0;
        this.durationIn = 500;
        this.durationOut = 500;
        this.disableContainer = false;
        this.mangerie = mangerie;
        this.container = container;
        this.mainElement = elem;
        this.mainElement.style.display = "none";
    }
    // FADE LOGIC: FADE IN AND OUT OF EXISTENCE
    Fade(delta) {
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
                    if (this.disableContainer)
                        this.container.style.display = "none";
                    this.mainElement.style.display = "none";
                    this.runtime = 0;
                }
                else {
                    if (this.disableContainer) {
                        this.container.style.opacity = (1 - this.runtime / this.durationOut).toString();
                    }
                    else {
                        this.mainElement.style.opacity = (1 - this.runtime / this.durationOut).toString();
                    }
                }
                break;
        }
        return this.phase;
    }
    // ENABLE THE COMPONENT
    Enable(full = false) {
        if (full)
            this.container.style.display = "block";
        this.mainElement.style.display = "flex";
        this.runtime = 0;
        this.phase = PhadePhase.In;
    }
    // DISABLE THE COMPONENT
    Disable(full = false) {
        if (full)
            this.disableContainer = true;
        this.runtime = 0;
        this.phase = PhadePhase.Out;
    }
}
