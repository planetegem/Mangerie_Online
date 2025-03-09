import { PhadePhase } from "../Enums.js";
// VARIATION ON THE PHADEBLOCK, USED FOR MODALS. COMBINES FADE IN WITH VERTICAL TRANSLATION
export default class PhadeModal {
    // CONSTRUCTOR
    constructor(modal) {
        // ANIMATION PROPERTIES
        this.fadeIn = 500;
        this.fadeOut = 500;
        this.verticalMove = 50;
        this.runtime = 0;
        this.phase = PhadePhase.Done;
        this.modal = modal;
        this.modal.style.display = "none";
        this.modal.style.opacity = "0";
    }
    // ON AND OFF
    Enable() {
        this.phase = PhadePhase.In;
        this.runtime = 0;
        this.modal.style.display = "flex";
        this.modal.style.opacity = "0";
    }
    Disable() {
        this.phase = PhadePhase.Out;
        this.runtime = 0;
    }
    Reset() {
        this.modal.style.display = "none";
        this.modal.style.opacity = "0";
    }
    // ANIMATION METHOD: RETURNS ANIMATION PHASE
    Update(delta) {
        this.runtime += delta;
        switch (this.phase) {
            case PhadePhase.In:
                if (this.runtime >= this.fadeIn) {
                    this.modal.style.opacity = "1";
                    this.modal.style.transform = "translateY(0px)";
                    this.phase = PhadePhase.Hold;
                }
                else {
                    this.modal.style.opacity = (this.runtime / this.fadeIn).toString();
                    this.modal.style.transform = "translateY(" + (1 - this.runtime / this.fadeIn) * this.verticalMove + "px)";
                }
                break;
            case PhadePhase.Out:
                if (this.runtime >= this.fadeOut) {
                    this.modal.style.display = "none";
                    this.modal.style.transform = "translateY(0px)";
                    this.modal.style.opacity = "0";
                    this.runtime = 0;
                    this.phase = PhadePhase.Done;
                }
                else {
                    this.modal.style.opacity = (1 - this.runtime / this.fadeOut).toString();
                    this.modal.style.transform = "translateY(" + ((this.runtime / this.fadeIn) * -this.verticalMove) + "px)";
                }
                break;
        }
        return this.phase;
    }
}
