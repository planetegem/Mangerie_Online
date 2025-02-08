import Mangerie from "../Mangerie.js";
import { PhadePhase } from "../Enums.js";

export default class PhadeBlock {
    // LINK TO STATE HANDLER
    protected mangerie: Mangerie;

    // HTML ELEMENTS
    protected mainElement: HTMLElement;

    // ANIMATION PROPS
    protected phase: PhadePhase = PhadePhase.Hold;
    protected runtime: number = 0;
    protected durationIn: number = 500;
    protected durationOut: number = 500;
    protected disableContainer: boolean = false;
    protected enableContainer: boolean = false;

    // CONSTRUCTOR
    constructor (mangerie: Mangerie, elem: HTMLElement){
        this.mangerie = mangerie;
        this.mainElement = elem;
        this.mainElement.style.display = "none";
    }

    // FADE LOGIC: FADE IN AND OUT OF EXISTENCE
    protected Fade(delta: number): PhadePhase {
        this.runtime += delta;

        switch(this.phase){
            // Fading in
            case PhadePhase.In:
                if (this.runtime >= this.durationIn){
                    this.mainElement.style.opacity = "1";
                    this.phase = PhadePhase.Hold;
                } else {
                    this.mainElement.style.opacity = (this.runtime/this.durationIn).toString();
                }
                break;
            
            // Fading out
            case PhadePhase.Out:
                if (this.runtime > this.durationOut){
                    this.phase = PhadePhase.Done;
                    this.mainElement.style.display = "none";
                    this.runtime = 0;

                } else {
                    this.mainElement.style.opacity = (1 - this.runtime/this.durationOut).toString();
                }
                break;
        }
        return this.phase;
    }

    // ENABLE THE COMPONENT
    public Enable() {
        this.mainElement.style.display = "flex";
        this.runtime = 0;
        this.phase = PhadePhase.In;
    }

    // DISABLE THE COMPONENT
    public Disable() {
        this.runtime = 0;
        this.phase = PhadePhase.Out;
    }
}
