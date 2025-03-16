import { PhadePhase } from "../../Enums.js";
export default class ErrorFeedbackBlock {
    constructor(errorLabel, sound = null) {
        // ANIMATION PROPS
        this.blinkDuration = 300;
        this.numberOfBlinks = 3;
        this.totalDuration = 5000;
        this.runtime = 0;
        this.durationOut = 500;
        this.errorElements = document.getElementsByClassName("in-error");
        // STATE HANDLER
        this.phase = PhadePhase.Done;
        this.errorLabel = errorLabel;
        this.sound = sound;
    }
    // MAIN SETTER: enable or disable component when message changes
    set Message(value) {
        if (value) {
            this.errorLabel.innerHTML = value;
            this.Enable();
        }
        else {
            this.Disable();
        }
    }
    // ENABLE / DISABLE methods
    Enable() {
        this.runtime = 0;
        this.phase = PhadePhase.In;
        this.errorElements = document.getElementsByClassName("in-error");
        this.errorLabel.style.opacity = "1";
        this.errorLabel.style.visibility = "visible";
        if (this.sound) {
            this.sound.currentTime = 0;
            this.sound.play();
        }
    }
    Disable() {
        this.phase = PhadePhase.Done;
        this.errorLabel.style.visibility = "hidden";
        this.errorLabel.style.opacity = "0";
    }
    // MAIN UPDATE METHOD: blink at start, fade out at end
    Update(delta) {
        this.runtime += delta;
        switch (this.phase) {
            case PhadePhase.Done:
                break;
            case PhadePhase.In:
                this.errorElements = document.getElementsByClassName("in-error");
                let visible = true;
                for (let i = 1; i <= this.numberOfBlinks * 2; i += 2) {
                    if ((this.runtime > this.blinkDuration * i) && (this.runtime < this.blinkDuration * (i + 1))) {
                        visible = false;
                        break;
                    }
                }
                if (this.runtime >= this.blinkDuration * this.numberOfBlinks * 2) {
                    visible = true;
                    this.phase = PhadePhase.Hold;
                }
                this.errorLabel.style.visibility = (visible) ? "visible" : "hidden";
                if (this.errorElements.length > 0) {
                    for (let elem of this.errorElements) {
                        if (visible) {
                            elem.classList.add("error");
                        }
                        else {
                            elem.classList.remove("error");
                        }
                    }
                }
                break;
            case PhadePhase.Hold:
                if (this.runtime >= this.totalDuration)
                    this.phase = PhadePhase.Out;
                break;
            case PhadePhase.Out:
                if (this.runtime >= this.totalDuration) {
                    this.errorLabel.style.opacity = (1 - (this.runtime - this.totalDuration) / this.durationOut).toString();
                }
                else {
                    this.errorLabel.style.opacity = "1";
                }
                if (this.runtime >= this.totalDuration + this.durationOut) {
                    this.Disable();
                }
                break;
        }
        return this.phase;
    }
}
