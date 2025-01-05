import { GameState, PhadePhase } from "../Enums.js";
import PhadeBlock from "./PhadeBlock.js";
export default class MenuBlock extends PhadeBlock {
    constructor(mangerie, container) {
        var _a, _b, _c, _d;
        const menu = (_a = document.getElementById("main-menu")) !== null && _a !== void 0 ? _a : document.createElement("menu-error");
        container.appendChild(menu);
        super(mangerie, container, menu);
        // MENU BUTTONS
        this.start = (_b = document.getElementById("start-button")) !== null && _b !== void 0 ? _b : document.createElement("start-error");
        this.album = (_c = document.getElementById("album-button")) !== null && _c !== void 0 ? _c : document.createElement("album-error");
        this.info = (_d = document.getElementById("info-button")) !== null && _d !== void 0 ? _d : document.createElement("info-error");
        this.durationIn = 1000;
        this.durationOut = 1000;
        // BUTTON EVENT LISTENERS
        this.start.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
            const disable = this.Disable.bind(this);
            disable(true);
            this.mangerie.SetState(GameState.Starting);
        });
        this.album.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
        });
        menu.appendChild(this.album);
        this.info.addEventListener("click", () => {
            if (this.phase != PhadePhase.Hold)
                return;
        });
        menu.appendChild(this.info);
    }
    Update(delta) {
        const fader = this.Fade.bind(this);
        return fader(delta);
    }
}
