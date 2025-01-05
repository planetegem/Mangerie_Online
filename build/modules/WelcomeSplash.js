export default class WelcomeSplash {
    constructor(parent) {
        var _a, _b;
        // ANIMATION PROPERTIES
        this.runtime = 0;
        this.phase = 1;
        this.fadeIn = 300;
        this.fadeOut = 1000;
        this.container = (_a = document.getElementById("menu-container")) !== null && _a !== void 0 ? _a : document.createElement("error-welcome");
        this.welcome = (_b = document.getElementById("welcome-text")) !== null && _b !== void 0 ? _b : document.createElement("error-welcome");
    }
    Create() {
        this.container.style.display = "block";
        this.phase = 1;
        this.runtime = 0;
    }
    Update(delta) {
        this.runtime += delta;
        switch (this.phase) {
            // FADING IN
            case 1:
                if (this.runtime > this.fadeIn) {
                    this.welcome.style.opacity = "1";
                    this.welcome.addEventListener("click", () => {
                        this.phase = 3;
                        this.runtime = 0;
                    });
                    this.phase = 2;
                }
                else {
                    this.welcome.style.opacity = (this.runtime / this.fadeIn).toString();
                }
                break;
            // AWAITING INPUT
            case 2:
                break;
            // FADING OUT
            case 3:
                if (this.runtime > this.fadeOut) {
                    this.Destroy();
                    this.phase = 4;
                    this.runtime = 0;
                }
                else {
                    this.container.style.opacity = (1 - this.runtime / this.fadeOut).toString();
                }
                break;
            // DONE
            case 4:
                break;
        }
        return this.phase;
    }
    Destroy() {
        this.container.style.display = "none";
        this.welcome.style.display = "none";
    }
}
