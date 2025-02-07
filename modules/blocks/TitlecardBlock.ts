import { GameState, PhadePhase } from "../Enums.js";
import { Block } from "../Interfaces.js";
import Mangerie from "../Mangerie.js";
import PhadeBlock from "./PhadeBlock.js";

export default class TitlecardBlock extends PhadeBlock implements Block {

    // HTML Elements
    private titleContainer: HTMLElement = document.getElementById("title-container")!;
    private titleIntro: HTMLElement = document.getElementById("title-intro")!;
    private lines: HTMLElement[] = [];

    // Animation timing props
    private customRuntime: number = 0;
    private textfadeTime: number = 1500;
    private startdelay: number = 500;
    private fadeIntro: number = 500;
    private titledelay: number = 500;
    private currentdelay: number = 0;
    private finalPause: number = 1000;

    // Sound effect
    private harpSound: HTMLAudioElement;
    private soundPlayed: boolean = false;

    // Title string
    private title: string = "No title set";
    public set Title(value: string) { 
        this.title = value;
        this.lines = [];
        this.titleIntro.style.opacity = "0";
        this.customRuntime = 0;


        // LINE SEPERATION LOGIC
        // 1. Clear container element
        this.titleContainer.textContent = "";

        // 2. Create line tester: invisible element to test string width
        const lineTester: HTMLElement = document.createElement("span");
        lineTester.id = "line-tester";
        this.titleContainer.appendChild(lineTester);

        // 3. Split string into seperate words
        const words: string[] = this.title.split(" ");
        let line: string = "";

        // 4. Fill line with sperate words until width exceeds allowance
        words.forEach((word) => {
            let tempLine = (line === "") ? line + word : line + " " + word;
            lineTester.innerText = tempLine;

            if (lineTester.offsetWidth >= this.titleContainer.offsetWidth * 0.8){
                let lineElement: HTMLElement = document.createElement("span");
                lineElement.classList.add("title-line");
                lineElement.innerText = line;
                this.titleContainer.appendChild(lineElement);
                this.lines.push(lineElement);
                line = word;
            } else {
                line = tempLine;
            }
        });
        let lineElement: HTMLElement = document.createElement("span");
        lineElement.classList.add("title-line");
        lineElement.innerText = line;
        this.titleContainer.appendChild(lineElement);
        this.lines.push(lineElement);

        // 4. When done, remove lineTester from DOM
        this.titleContainer.removeChild(lineTester);

        // 5. Apply animation timers
        let totalWidth: number = 0;
        this.currentdelay = this.startdelay + this.titledelay + this.fadeIntro + this.durationIn;

        // 6. first get total width of all elements
        this.lines.forEach(element => {
            totalWidth += element.offsetWidth; 
        });

        // 7. Then apply animation duration & delay relative to element width
        this.lines.forEach(element => {
            let rel: number = element.offsetWidth / totalWidth;
            element.style.animationDuration = (this.textfadeTime * rel) / 1000 + "s";
            element.style.animationDelay = (this.currentdelay + 100) / 1000 + "s";
            element.style.animationName = "menuFade";
            this.currentdelay += this.textfadeTime * rel + 100;
        });
    }

    // CONSTRUCTOR: on resize, recalculate title lines and restart animations
    constructor(mangerie: Mangerie){
        const elem: HTMLElement = document.getElementById("title-card")!;
        super(mangerie, elem, elem);
        this.durationOut = 1000;
        this.harpSound = mangerie.sounds.content.get("harps")!.object;

        window.addEventListener("resize", () => {
            this.Title = this.title;
            this.customRuntime = 0;
        })
    }

    // UPDATE FUNCTION: PLAY SOUND EFFECT & START PHADEOUT
    public Update(delta: number): PhadePhase {
        const fader = this.Fade.bind(this);
        const state: PhadePhase = fader(delta);
        this.customRuntime += delta;
        
        switch(state) {
            case PhadePhase.Hold:
                if (this.customRuntime >= this.titledelay + this.durationIn)
                    this.titleIntro.style.opacity = ((this.customRuntime - this.titledelay - this.durationIn)/this.fadeIntro).toString();
        
                if (this.customRuntime >= this.titledelay + this.fadeIntro + this.durationIn)
                    this.titleIntro.style.opacity = "1";

                if (this.customRuntime >= this.titledelay + this.fadeIntro + this.durationIn + this.startdelay && !this.soundPlayed){
                    this.soundPlayed = true;
                    this.harpSound.play();
                }

                if (this.customRuntime >= this.currentdelay + 1000){
                    this.customRuntime = 0;
                    const disable = this.Disable.bind(this);
                    disable(true);
                }
                break;

            case PhadePhase.Done:
                // Reset sound effect
                this.soundPlayed = false;
                this.harpSound.pause();
                this.harpSound.currentTime = 0;

                // Start game
                if (this.customRuntime >= this.durationOut + this.finalPause)
                    this.mangerie.SetState(GameState.StartGame);

                break;
        }
        return state;
    }
}