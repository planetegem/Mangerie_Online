import { PhadePhase } from "../Enums.js";

// VARIATION ON THE PHADEBLOCK, USED FOR MODALS. COMBINES FADE IN WITH VERTICAL TRANSLATION
export default class PhadeModal {
    // ANIMATION PROPERTIES
    protected fadeIn: number = 500;
    protected fadeOut: number = 500;
    protected verticalMove: number = 50;
    protected runtime: number = 0;
    protected phase: PhadePhase = PhadePhase.Done;
    
    // HTML ELEMENT (ALWAYS A MODAL)
    protected modal: HTMLElement; 

    // CONSTRUCTOR
    public constructor(modal: HTMLElement){
        this.modal = modal;
        this.modal.style.display = "none";
        this.modal.style.opacity = "0";
    }

    // ON AND OFF
    public Enable(): void {
        this.phase = PhadePhase.In;
        this.runtime = 0;
        this.modal.style.display = "flex";
        this.modal.style.opacity = "0";
    }
    public Disable(): void {
        this.phase = PhadePhase.Out;
        this.runtime = 0;
    }

    // ANIMATION METHOD: RETURNS ANIMATION PHASE
    public Fade(delta: number): PhadePhase {
        this.runtime += delta;
        switch (this.phase){
            case PhadePhase.In:
                if (this.runtime >= this.fadeIn){
                    this.modal.style.opacity = "1";
                    this.modal.style.transform = "translateY(0px)";
                    this.phase = PhadePhase.Hold;
                } else {
                    this.modal.style.opacity = (this.runtime/this.fadeIn).toString();
                    this.modal.style.transform = "translateY(" + (1 - this.runtime/this.fadeIn) * this.verticalMove + "px)";
                }
                break;
            
            case PhadePhase.Out:
                if (this.runtime >= this.fadeOut){
                    this.modal.style.display = "none";
                    this.modal.style.transform = "translateY(0px)";
                    this.modal.style.opacity = "0";
                    this.runtime = 0;
                    this.phase = PhadePhase.Done;

                } else {
                    this.modal.style.opacity = (1 - this.runtime/this.fadeOut).toString();
                    this.modal.style.transform = "translateY(" + ((this.runtime/this.fadeIn) * -this.verticalMove) + "px)";
                }
                break;
        }
        return this.phase;
    }
}