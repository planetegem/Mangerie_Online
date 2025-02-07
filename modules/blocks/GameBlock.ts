import { GameState, PhadePhase } from "../Enums.js";
import Mangerie from "../Mangerie.js";
import { Block, StandardModule } from "../Interfaces.js";
import Kaleidoscope from "../kaleidoscope/Kaleidoscope.js";


export default class GameBlock extends Kaleidoscope implements Block {
    // FUNCTIONAL PROPERTIES
    protected mangerie: Mangerie;
    private tutorialRequired: boolean;

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

        this.tutorialRequired = (localStorage.getItem("firstTime") == "true" || localStorage.getItem("firstTime") == null);

        document.getElementById("tutorial-button")!.addEventListener("click", () => {
            this.mangerie.SetState(GameState.Tutorial);
        });
        document.getElementById("return-button")!.addEventListener("click", () => {
            this.Disable();
        });

    }

    public Enable(): void {
        this.phase = PhadePhase.In;
        this.runtime = 0;

        // Reset kaleidoscope props
        this.Resize();
        this.interactionAllowed = false;
        this.modules.forEach((module) => {
            module.Reset();
            module.Draw();
        });
        this.switchPlayed = false;
    }
    public Disable(): void {
        this.phase = PhadePhase.Out;
        this.runtime = 0;
    }


    public Update(delta: number): PhadePhase {
        this.runtime += delta;

        switch (this.phase){
            case PhadePhase.In:
                if (this.runtime >= this.startFade){
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
                if (this.runtime >= this.startFade){
                    this.mangerie.SetState(GameState.Menu);
                    this.phase = PhadePhase.Done;
                    document.body.style.cursor = "";
                    this.runtime = 0;
                } else {
                    this.container.style.opacity = (1 - this.runtime/this.startFade).toString();
                }
                break;
        }

        for (let module of this.modules){
            module.Draw();
        }

        return this.phase;
    }
}