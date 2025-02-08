import { GameState, PhadePhase } from "../Enums.js";
import PhadeBlock from "./PhadeBlock.js";
export default class TitlecardBlock extends PhadeBlock {
    set Title(value) {
        this.title = value;
        this.lines = [];
        this.titleIntro.style.opacity = "0";
        this.customRuntime = 0;
        // LINE SEPERATION LOGIC
        // 1. Clear container element
        this.titleContainer.textContent = "";
        // 2. Create line tester: invisible element to test string width
        const lineTester = document.createElement("span");
        lineTester.id = "line-tester";
        this.titleContainer.appendChild(lineTester);
        // 3. Split string into seperate words
        const words = this.title.split(" ");
        let line = "";
        // 4. Fill line with sperate words until width exceeds allowance
        words.forEach((word) => {
            let tempLine = (line === "") ? line + word : line + " " + word;
            lineTester.innerText = tempLine;
            if (lineTester.offsetWidth >= this.titleContainer.offsetWidth * 0.8) {
                let lineElement = document.createElement("span");
                lineElement.classList.add("title-line");
                lineElement.innerText = line;
                this.titleContainer.appendChild(lineElement);
                this.lines.push(lineElement);
                line = word;
            }
            else {
                line = tempLine;
            }
        });
        let lineElement = document.createElement("span");
        lineElement.classList.add("title-line");
        lineElement.innerText = line;
        this.titleContainer.appendChild(lineElement);
        this.lines.push(lineElement);
        // 4. When done, remove lineTester from DOM
        this.titleContainer.removeChild(lineTester);
        // 5. Apply animation timers
        let totalWidth = 0;
        this.currentdelay = this.startdelay + this.titledelay + this.fadeIntro + this.durationIn;
        // 6. first get total width of all elements
        this.lines.forEach(element => {
            totalWidth += element.offsetWidth;
        });
        // 7. Then apply animation duration & delay relative to element width
        this.lines.forEach(element => {
            let rel = element.offsetWidth / totalWidth;
            element.style.animationDuration = (this.textfadeTime * rel) / 1000 + "s";
            element.style.animationDelay = (this.currentdelay + 100) / 1000 + "s";
            element.style.animationName = "menuFade";
            this.currentdelay += this.textfadeTime * rel + 100;
        });
    }
    // OVERRIDE ENABLE FUNCTION: set title after calling super.Enable to mka sure element has real width
    Enable() {
        super.Enable();
        this.Title = this.mangerie.CurrentAlbum.title;
    }
    // CONSTRUCTOR: on resize, recalculate title lines and restart animations
    constructor(mangerie) {
        const elem = document.getElementById("title-card");
        super(mangerie, elem);
        // HTML Elements
        this.titleContainer = document.getElementById("title-container");
        this.titleIntro = document.getElementById("title-intro");
        this.lines = [];
        // Animation timing props
        this.customRuntime = 0;
        this.textfadeTime = 1500;
        this.startdelay = 500;
        this.fadeIntro = 500;
        this.titledelay = 500;
        this.currentdelay = 0;
        this.finalPause = 1000;
        this.soundPlayed = false;
        // Title string
        this.title = "No title set";
        this.durationOut = 1000;
        this.harpSound = mangerie.sounds.content.get("harps").object;
        window.addEventListener("resize", () => {
            this.Title = this.title;
            this.customRuntime = 0;
        });
    }
    // UPDATE FUNCTION: PLAY SOUND EFFECT & START PHADEOUT
    Update(delta) {
        const fader = this.Fade.bind(this);
        const state = fader(delta);
        this.customRuntime += delta;
        switch (state) {
            case PhadePhase.Hold:
                if (this.customRuntime >= this.titledelay + this.durationIn)
                    this.titleIntro.style.opacity = ((this.customRuntime - this.titledelay - this.durationIn) / this.fadeIntro).toString();
                if (this.customRuntime >= this.titledelay + this.fadeIntro + this.durationIn)
                    this.titleIntro.style.opacity = "1";
                if (this.customRuntime >= this.titledelay + this.fadeIntro + this.durationIn + this.startdelay && !this.soundPlayed) {
                    this.soundPlayed = true;
                    this.harpSound.play();
                }
                if (this.customRuntime >= this.currentdelay + 1000) {
                    this.customRuntime = 0;
                    const disable = this.Disable.bind(this);
                    disable();
                }
                break;
            case PhadePhase.Done:
                // Reset sound effect
                this.soundPlayed = false;
                this.harpSound.pause();
                this.harpSound.currentTime = 0;
                // Start game
                if (this.customRuntime >= this.durationOut + this.finalPause)
                    this.mangerie.SetState(GameState.Playing);
                break;
        }
        return state;
    }
}
