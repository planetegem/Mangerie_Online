import { ErrorMessages, PhadePhase } from "../../Enums.js";
import { Block } from "../../Interfaces.js";

export default class ErrorFeedbackBlock implements Block {
    
    // ANIMATION PROPS
    private blinkDuration: number = 300;
    private numberOfBlinks: number = 3;
    private totalDuration: number = 5000;
    private runtime: number = 0;
    private durationOut: number = 500;
    private errorElements: HTMLCollection = document.getElementsByClassName("in-error");

    // STATE HANDLER
    private phase: PhadePhase = PhadePhase.Done;

    // SOUND EFFECT
    private sound: HTMLAudioElement | null;

    // CONSTRUCTOR: only needs to know which html element it influences
    private errorLabel: HTMLElement;
    constructor(errorLabel: HTMLElement, sound: HTMLAudioElement | null = null){
        this.errorLabel = errorLabel;
        this.sound = sound;
    }

    // MAIN SETTER: enable or disable component when message changes
    public set Message(value: ErrorMessages | null){
        if (value) {
            this.errorLabel.innerHTML = value;
            this.Enable();
        } else {
            this.Disable();
        }
    }

    // ENABLE / DISABLE methods
    public Enable(): void {
        this.runtime = 0;
        this.phase = PhadePhase.In;
        this.errorElements = document.getElementsByClassName("in-error");
        this.errorLabel.style.opacity = "1"; 
        this.errorLabel.style.visibility = "visible";

        if (this.sound){
            this.sound.currentTime = 0;
            this.sound.play();
        }
    }
    public Disable(): void {
        this.phase = PhadePhase.Done;
        this.errorLabel.style.visibility = "hidden";
        this.errorLabel.style.opacity = "0";
    }

    // MAIN UPDATE METHOD: blink at start, fade out at end
    public Update(delta: number): PhadePhase {
        this.runtime += delta;

        switch (this.phase){
            case PhadePhase.Done:
                break;
            
            case PhadePhase.In:
                this.errorElements = document.getElementsByClassName("in-error");
                let visible: boolean = true;
                for (let i = 1; i <= this.numberOfBlinks * 2; i += 2){
                    if ((this.runtime > this.blinkDuration * i) && (this.runtime < this.blinkDuration * (i + 1))){
                        visible = false;
                        break;
                    }
                }
                if (this.runtime >= this.blinkDuration * this.numberOfBlinks * 2){
                    visible = true;
                    this.phase = PhadePhase.Hold;
                }
                this.errorLabel.style.visibility = (visible) ? "visible" : "hidden";
                if (this.errorElements.length > 0){ 
                    for (let elem of this.errorElements){
                        if (visible){
                            elem.classList.add("error");
                        } else {
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
                if (this.runtime >= this.totalDuration){
                    this.errorLabel.style.opacity = (1 - (this.runtime - this.totalDuration)/this.durationOut).toString();
                } else {
                    this.errorLabel.style.opacity = "1"; 
                }
        
                if (this.runtime >= this.totalDuration + this.durationOut){
                    this.Disable();
                }
                break;

        }
        return this.phase;
    }
}