import { GameState, PhadePhase } from "../Enums.js";
import Mangerie from "../Mangerie.js";
import PhadeBlock from "./PhadeBlock.js";
import PhadeModal from "./PhadeModal.js";

export default class TutorialBlock extends PhadeBlock {
    private articles: PhadeModal[];
    private currentArticle: PhadeModal;
    private previousArticle: PhadeModal | null = null;
    private step: number = 0;
    private interactionAllowed: boolean = false;
    private start: boolean = true;

    // CONSTRUCTOR
    constructor(mangerie: Mangerie){
        const container: HTMLElement = document.getElementById("tutorial")!;
        super(mangerie, container);

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
                localStorage.setItem("firstTime", "false");
                const disable = this.Disable.bind(this);
                disable();
                this.mangerie.SetState(GameState.Playing);
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

    // OVERRIDE ENABLE: add logic to reset articles before starting enable animation
    public Enable(): void {
        this.step = 0;
        this.currentArticle = this.articles[0];
        for (let article of this.articles){
            article.Reset();
        }
        this.start = true;
        super.Enable();
    }

    // UPDATE IMPLEMENTATION: ADD SWITCHING ANIMATION
    public Update(delta: number): PhadePhase {
        
        if (this.phase == PhadePhase.Hold){
            if (this.start){
                this.currentArticle.Enable();
                this.start = false;
            }

            if (this.previousArticle !== null && this.previousArticle.Update(delta) === PhadePhase.Done){
                this.previousArticle = null;
                this.currentArticle.Enable();
            }

            let fade = this.currentArticle.Update(delta);
            this.interactionAllowed = (fade === PhadePhase.Hold);
        }
        
        super.Update(delta);
        return this.phase; 
    }
}