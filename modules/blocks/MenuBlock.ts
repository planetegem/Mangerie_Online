import { GameState, PhadePhase } from "../Enums.js";
import Mangerie from "../Mangerie.js";
import PhadeBlock from "./PhadeBlock.js";

export default class MenuBlock extends PhadeBlock {
    
    // STATE MEMORY
    private startingGame: boolean = false;
    private fading: boolean = true;
    private enabled: boolean = false;

    // SOUND EFFECTS
    private openingSound: HTMLAudioElement;
    private openingSoundPlayed: boolean = false;
    private PlayOpeningSound(): void {
        this.openingSound.currentTime = 0;
        this.openingSound.play();
        this.openingSoundPlayed = true;
    }
    private windowSound: HTMLAudioElement;
    private windowSoundPlayed: boolean = false;
    private PlayWindowSound(): void {
        this.windowSound.currentTime = 0;
        this.windowSound.play();
        this.windowSoundPlayed = true;
    }
    private buttonSound: HTMLAudioElement;
    private PlayBowlSound(): void {
        this.buttonSound.currentTime = 0;
        this.buttonSound.play();
    }

    // MENU BUTTONS
    private start: HTMLElement = document.getElementById("start-button")!;
    private album: HTMLElement = document.getElementById("album-button")!;
    private info: HTMLElement = document.getElementById("info-button")!;
    private logoDeco: HTMLElement = document.getElementById("online-deco")!;
    private buttonContainer: HTMLElement = document.getElementById("menu-buttons")!;

    // TIMINGS
    private logoFade: number = 1800;
    private buttonsDelay: number = 1500;
    private buttonsFade: number = 1000;


    // OVERRIDE ENABLE AND DISABLE METHODS (FOR STATE SWITCHING WITHOUT REAL DISABLE)
    public Disable(): void {
        this.enabled = false;
        super.Disable();
    }
    public Enable(): void {
        if (!this.enabled) super.Enable();
    }

    // CONSTRUCTOR: ADD EVENT LISTENERS
    constructor(mangerie: Mangerie){
        const menu = document.getElementById("main-menu")!;
        super(mangerie, menu);

        this.durationIn = 1000;
        this.durationOut = 1000;

        this.logoDeco.style.animationDuration = (this.logoFade/1000) + "s";

        // BUTTON EVENT LISTENERS
        this.start.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;

            this.PlayBowlSound();
            this.Disable();
            this.startingGame = true;
        });
        this.album.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;
            this.mangerie.SetState(GameState.AlbumManager);
            this.PlayBowlSound();
        });
        this.info.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold) return;
            this.mangerie.SetState(GameState.Info);
            this.PlayBowlSound();
        });

        // Set sound effects
        this.openingSound = mangerie.sounds.content.get("wind-up")!.object;
        this.buttonSound = mangerie.sounds.content.get("bowl2")!.object;
        this.windowSound = mangerie.sounds.content.get("window")!.object;

    }

    // MAIN UPDATE FUNCTION: ANIMATE LOGO
    public Update(delta: number): number {
        super.Update(delta);

        switch(this.phase){
            case PhadePhase.Hold:
                this.logoDeco.classList.add("start-fade");
                if (!this.openingSoundPlayed && this.runtime >= this.logoFade - 400){
                    this.PlayOpeningSound();
                }

                if (this.fading){
                    if (this.runtime >= this.logoFade + this.buttonsDelay + this.buttonsFade){
                        this.buttonContainer.style.opacity = "1";
                        this.fading = false;
                    } else if (this.runtime >= this.logoFade + this.buttonsDelay){
                        if (!this.windowSoundPlayed) this.PlayWindowSound();
                        this.buttonContainer.style.opacity = ((this.runtime - (this.logoFade + this.buttonsDelay)) / this.buttonsFade).toString();
                    }
                }
                break;
            case PhadePhase.Done:
                this.logoDeco.classList.remove("start-fade");
                this.fading = true;
                this.buttonContainer.style.opacity = "0";

                // Reset sound effect
                this.openingSoundPlayed = false;
                this.windowSoundPlayed = false;

                if (this.startingGame){
                    this.startingGame = false;
                    this.mangerie.SetState(GameState.Titlecard);
                }
        }    
        return this.phase;  
    }
}