import { GameState, PhadePhase } from "../Enums.js";
import Kaleidoscope from "../kaleidoscope/Kaleidoscope.js";
export default class GameBlock extends Kaleidoscope {
    // CONSTRUCTOR
    constructor(mangerie, container) {
        super(mangerie);
        this.tutorialRequired = true;
        // ANIMATION PROPERTIES
        this.phase = PhadePhase.In;
        this.runtime = 0;
        this.startFade = 1000;
        this.holdTime = 1500;
        this.mangerie = mangerie;
        this.container = container;
    }
    Enable() {
        this.phase = PhadePhase.In;
        this.runtime = 0;
    }
    Disable() {
    }
    Update(delta) {
        this.runtime += delta;
        switch (this.phase) {
            case PhadePhase.In:
                if (this.runtime >= this.startFade) {
                    this.mangerie.SetState(GameState.Complete);
                    this.ResetKaleidoscope(0);
                    this.phase = PhadePhase.Hold;
                    this.runtime = 0;
                }
                else {
                    this.container.style.opacity = (this.runtime / this.startFade).toString();
                }
                break;
            case PhadePhase.Hold:
                if (this.resetting) {
                    this.ResetAnimation(delta);
                }
                else if (this.tutorialRequired && this.runtime >= this.holdTime) {
                    this.tutorialRequired = false;
                    this.mangerie.SetState(GameState.Tutorial);
                }
                break;
            case PhadePhase.Out:
                break;
        }
        for (let module of this.modules) {
            module.Draw();
        }
        return this.phase;
    }
}
