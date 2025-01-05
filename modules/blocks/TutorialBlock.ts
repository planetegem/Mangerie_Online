import { GameState, PhadePhase } from "../Enums.js";
import { Block } from "../Interfaces.js";
import Mangerie from "../Mangerie.js";
import PhadeBlock from "./PhadeBlock.js";
import PhadeModal from "./PhadeModal.js";

export default class TutorialBlock extends PhadeBlock implements Block {
    private articles: PhadeModal[];
    private currentArticle: PhadeModal;
    private previousArticle: PhadeModal | null = null;
    private step: number = 0;
    private interactionAllowed: boolean = false;
    private start: boolean = true;

    // CONSTRUCTOR
    constructor(mangerie: Mangerie){
        const container: HTMLDialogElement = document.getElementById("tutorial") as HTMLDialogElement;
        super(mangerie, container, container);

        this.articles = [];
        let htmlArticles: HTMLElement[] = Array.from(document.querySelectorAll("#tutorial article"));
        for (let i = 0; i < htmlArticles.length; i++){
            const span = document.createElement("span");
            span.innerText = "-- click/tap to continue --";
            const h3 = document.createElement("h3");
            h3.innerText = "[tutorial " + (i + 1) + "/" + htmlArticles.length + "]";

            const currentArticle: HTMLElement = htmlArticles[i];
            currentArticle.appendChild(h3);
            currentArticle.appendChild(span);

            this.articles.push(new PhadeModal(currentArticle))
        }

        this.currentArticle = this.articles[0];
        this.mangerie = mangerie;

        // Event Listener
        container.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold || !this.interactionAllowed) return;

            const next = this.Next.bind(this);
            if (next()){
                const disable = this.Disable.bind(this);
                disable();
                // this.mangerie.SetState(GameState.Playing);
            }
        });
    }

    private Next(): boolean {
        if (this.step >= this.articles.length - 1)
            return true;

        this.step++;
        this.previousArticle = this.currentArticle;
        this.currentArticle = this.articles[this.step];
        this.previousArticle.Disable();
        return false;
    }

    // UPDATE IMPLEMENTATION: ADD SWITCHING ANIMATION
    public Update(delta: number): PhadePhase {

        if (this.phase == PhadePhase.Hold){
            if (this.start){
                this.currentArticle.Enable();
                this.start = false;
            }

            if (this.previousArticle !== null && this.previousArticle.Fade(delta) === PhadePhase.Done){
                this.previousArticle = null;
                this.currentArticle.Enable();
            }

            let fade = this.currentArticle.Fade(delta);
            this.interactionAllowed = (fade === PhadePhase.Hold);
        }
        
        const fader = this.Fade.bind(this);
        return fader(delta); 
    }
}