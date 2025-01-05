import { GameState, PhadePhase } from "../Enums.js";
import Mangerie from "../Mangerie.js";
import { Block, StandardModule } from "../Interfaces.js";
import Kaleidoscope from "../kaleidoscope/Kaleidoscope.js";


export default class GameBlock extends Kaleidoscope implements Block {
    // FUNCTIONAL PROPERTIES
    protected mangerie: Mangerie;
    private tutorialRequired: boolean = true;

    // ANIMATION PROPERTIES
    private phase: PhadePhase = PhadePhase.In;
    private runtime: number = 0;
    private startFade: number = 1000;
    private holdTime: number = 1500;

    // HTML ELEMENTS
    private container: HTMLElement;

    // CONSTRUCTOR
    constructor(mangerie: Mangerie, container: HTMLElement){
        super(mangerie);
        this.mangerie = mangerie;
        this.container = container;
    }

    public Enable(): void {
        this.phase = PhadePhase.In;
        this.runtime = 0;
    }
    public Disable(): void {

    }


    public Update(delta: number): PhadePhase {
        this.runtime += delta;

        switch (this.phase){
            case PhadePhase.In:
                if (this.runtime >= this.startFade){
                    this.mangerie.SetState(GameState.Complete);
                    this.ResetKaleidoscope(0);
                    this.phase = PhadePhase.Hold;
                    this.runtime = 0;
                } else {
                    this.container.style.opacity = (this.runtime/this.startFade).toString();
                }
                break;
            
            case PhadePhase.Hold:
                if (this.resetting){
                    this.ResetAnimation(delta);
                } else if (this.tutorialRequired && this.runtime >= this.holdTime){
                    
                    this.tutorialRequired = false;
                    this.mangerie.SetState(GameState.Tutorial);
                }
                break;
            
            case PhadePhase.Out:

                break;
        }

        for (let module of this.modules){
            module.Draw();
        }

        return this.phase;
    }
}