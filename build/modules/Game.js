import Angler from "./kaleidoscope/Angler.js";
import Kaleidoscope from "./kaleidoscope/Kaleidoscope.js";
import Rotator from "./kaleidoscope/Rotator.js";
import { easeInOut } from "./Helpers.js";
import ImageSelector from "./kaleidoscope/ImageSelector.js";
import { PhadePhase } from "./blocks/PhadeBlock.js";
import { GameState } from "./Enums.js";
export default class Game {
    get KaleidoscopeRadius() { return this.kaleidoscopeRadius; }
    get RotatorRadius() { return this.rotatorRadius; }
    get AnglerRadius() { return this.anglerRadius; }
    constructor(mangerie, container) {
        var _a;
        this.modules = [];
        this.interactors = [];
        this.dragger = { active: false, object: null };
        this.switchPlayed = false;
        // STATE HANDLER PROPERTIES
        this.resetting = false;
        this.interactionAllowed = false;
        this.phase = PhadePhase.Hold;
        // ANIMATION PROPERTIES
        this.rotatorAnimation = false;
        this.rotatorBudget = 0;
        this.rotatorDistance = 0;
        this.anglerAnimation = false;
        this.anglerBudget = 0;
        this.anglerDistance = 0;
        this.imageAnimation = false;
        this.usedBudget = 0;
        this.direction = 0;
        this.runtime = 0;
        this.startFade = 1000;
        this.mangerie = mangerie;
        this.container = container;
        // Set interface values: if viewed on mobile, interface elements should be larger
        let isMobile = window.innerWidth < 600;
        this.kaleidoscopeRadius = isMobile ? 0.32 : 0.35;
        this.rotatorRadius = isMobile ? 0.0275 : 0.02;
        this.anglerRadius = isMobile ? 0.0075 : 0.0075;
        // Assign sounds
        this.switchSound = mangerie.sounds.content.get("switch").object;
        // Create html structure    
        const main = (_a = document.querySelector("main")) !== null && _a !== void 0 ? _a : document.createElement("main");
        // Main container for kaleidoscope, rotator and angler
        const mainContainer = document.createElement("div");
        mainContainer.setAttribute("id", "main-container");
        main.appendChild(mainContainer);
        // Set Kaleidoscope
        const kalCanvas = document.createElement("canvas");
        kalCanvas.setAttribute("id", "kaleidoscope");
        mainContainer.appendChild(kalCanvas);
        this.kaleidoscope = new Kaleidoscope(kalCanvas, this);
        this.modules.push(this.kaleidoscope);
        // Set Rotator (determines rotation of image)
        const rotatorCanvas = document.createElement("canvas");
        rotatorCanvas.setAttribute("id", "rotator");
        mainContainer.appendChild(rotatorCanvas);
        let sounds = [
            mangerie.sounds.content.get("tick_1").object,
            mangerie.sounds.content.get("tick_2").object,
            mangerie.sounds.content.get("tick_3").object
        ];
        this.rotator = new Rotator(rotatorCanvas, this.kaleidoscope, this, sounds);
        this.modules.push(this.rotator);
        // Set Angler (determines mirror angle)
        const anglerCanvas = document.createElement("canvas");
        anglerCanvas.setAttribute("id", "angler");
        mainContainer.appendChild(anglerCanvas);
        this.angler = new Angler(anglerCanvas, this.kaleidoscope, this, mangerie.sounds.content.get("click").object);
        this.modules.push(this.angler);
        // Set image selector
        const imageCanvas = document.createElement("canvas");
        imageCanvas.setAttribute("id", "image");
        main.appendChild(imageCanvas);
        this.imageSelector = new ImageSelector(imageCanvas, this.kaleidoscope, mangerie.pictures.content);
        this.modules.push(this.imageSelector);
        // Give all canvas elements their proper size
        let canvasCollection = document.querySelectorAll("canvas");
        for (let canvas of canvasCollection) {
            canvas.setAttribute("width", canvas.offsetWidth.toString());
            canvas.setAttribute("height", canvas.offsetHeight.toString());
        }
        // Collect elements that allow interactions
        this.interactors.push(this.angler);
        this.interactors.push(this.rotator);
        // Create event listeners: mouse down / touch start
        mainContainer.addEventListener("mousedown", (e) => {
            if (this.interactionAllowed) {
                let mouseX = e.clientX - mainContainer.getBoundingClientRect().left, mouseY = e.clientY - mainContainer.getBoundingClientRect().top;
                this.ClickHandler(mouseX, mouseY);
            }
        });
        mainContainer.addEventListener("touchstart", (e) => {
            e.stopPropagation();
            e.preventDefault();
            let mouseX = e.changedTouches[0].clientX - mainContainer.getBoundingClientRect().left, mouseY = e.changedTouches[0].clientY - mainContainer.getBoundingClientRect().top;
            this.ClickHandler(mouseX, mouseY);
        });
        // Create event listeners: cursor move (hover & drag effects)
        main.addEventListener("mousemove", (e) => {
            if (this.interactionAllowed) {
                let mouseX = e.clientX - mainContainer.getBoundingClientRect().left, mouseY = e.clientY - mainContainer.getBoundingClientRect().top;
                this.MoveHandler(mouseX, mouseY);
            }
        });
        main.addEventListener("touchmove", (e) => {
            if (this.interactionAllowed) {
                e.stopPropagation();
                e.preventDefault();
                let mouseX = e.changedTouches[0].clientX - mainContainer.getBoundingClientRect().left, mouseY = e.changedTouches[0].clientY - mainContainer.getBoundingClientRect().top;
                this.MoveHandler(mouseX, mouseY);
            }
        });
        // Create event listeners: release mechanism
        window.addEventListener("mouseup", () => {
            this.Release();
        });
        window.addEventListener("touchend", (e) => {
            this.Release();
        });
        // Create event listeners: mouse wheel (for angler)
        window.addEventListener("wheel", (e) => {
            e.preventDefault();
            if (this.interactionAllowed) {
                if (e.deltaY > 0) {
                    this.angler.Position++;
                }
                else if (e.deltaY < 0) {
                    this.angler.Position--;
                }
            }
        }, { passive: false });
        // Create event listeners: arrow keys
        window.addEventListener("keydown", (e) => {
            if (this.interactionAllowed) {
                if (e.key == "ArrowRight") {
                    this.ResetKaleidoscope(1);
                }
                else if (e.key == "ArrowLeft") {
                    this.ResetKaleidoscope(-1);
                }
            }
        });
        document.getElementById("previous-image-desktop").addEventListener("click", () => {
            if (this.interactionAllowed) {
                this.ResetKaleidoscope(-1);
            }
        });
        document.getElementById("next-image-desktop").addEventListener("click", () => {
            if (this.interactionAllowed) {
                this.ResetKaleidoscope(1);
            }
        });
        document.getElementById("previous-image-mobile").addEventListener("click", () => {
            if (this.interactionAllowed) {
                this.ResetKaleidoscope(-1);
            }
        });
        document.getElementById("next-image-mobile").addEventListener("click", () => {
            if (this.interactionAllowed) {
                this.ResetKaleidoscope(1);
            }
        });
        // Recalculate all canvas elements when resizing
        window.addEventListener("resize", () => {
            // Set interface values: if viewed on mobile, interface elements should be larger
            let isMobile = window.innerWidth < 600;
            this.kaleidoscopeRadius = isMobile ? 0.32 : 0.35;
            this.rotatorRadius = isMobile ? 0.0275 : 0.02;
            this.anglerRadius = isMobile ? 0.0075 : 0.0075;
            for (let module of this.modules) {
                module.Resize();
            }
        });
        this.interactionAllowed = false;
    }
    // EVENT METHODS
    // Called when touching main canvas
    ClickHandler(mouseX, mouseY) {
        for (let elem of this.interactors) {
            if (elem.Test(mouseX, mouseY)) {
                elem.Press(mouseX, mouseY);
                this.dragger.active = true;
                this.dragger.object = elem;
                document.body.style.cursor = "grabbing";
                this.imageSelector.direction = 1;
                break;
            }
        }
    }
    MoveHandler(mouseX, mouseY) {
        // If dragging is active: call appropriate interaction element
        if (this.dragger.active && this.dragger.object != null) {
            this.dragger.object.Drag(mouseX, mouseY);
            return;
        }
        // Else: check all interaction elements for hover effects
        for (let elem of this.interactors) {
            if (elem.Test(mouseX, mouseY)) {
                document.body.style.cursor = "grab";
                return;
            }
        }
        // Finally: reset cursor to default
        document.body.style.cursor = "default";
    }
    Release() {
        if (this.interactionAllowed) {
            this.dragger.active = false;
            this.dragger.object = null;
            document.body.style.cursor = "default";
            for (let elem of this.interactors) {
                elem.Release();
            }
        }
    }
    // Reset all interaction elements to 0 & switch photo
    ResetKaleidoscope(direction) {
        // Stop interactions
        this.Release();
        this.interactionAllowed = false;
        this.resetting = true;
        document.body.style.cursor = "not-allowed";
        // If direction is 0 (only on first load), run last half of the image animation
        if (direction == 0) {
            this.usedBudget = 0.5;
            // Otherwise presume image switch animation: reset all parameters
        }
        else {
            // Signal if image is rotated
            let rot = this.rotator.Angle;
            if (rot > 0) {
                // If so, calculate budget to spend on rotation (10ms per degree travelled)
                this.rotatorAnimation = true;
                this.rotatorDistance = rot > Math.PI ? Math.PI * 2 - rot : rot;
                this.rotatorBudget = (10 * this.rotatorDistance * 180) / Math.PI;
            }
            else {
                this.rotatorAnimation = false;
            }
            // Signal if mirror is angled
            let ang = this.angler.Position;
            if (ang > 1) {
                // If so: calculate budget to spend on angler (150ms per position step)
                let maxPos = this.angler.MaxFacets;
                this.anglerDistance = ang > maxPos ? (2 * maxPos - 1) - ang : ang - 1;
                this.anglerBudget = this.anglerDistance * 200;
                this.anglerAnimation = true;
            }
            else {
                this.anglerAnimation = false;
            }
            console.log(this.anglerDistance);
            // Reset time budget (used to calculate animations)
            this.usedBudget = 0;
            this.imageAnimation = true;
            this.switchPlayed = false;
            this.direction = direction;
            // Force return image description
            this.imageSelector.direction = 1;
        }
    }
    // Passes new values to components during reset animation
    ResetAnimation(delta) {
        // Waterfall through animation segments: first reset rotator
        if (this.rotatorAnimation) {
            let elapsedTime = delta / this.rotatorBudget;
            this.usedBudget += elapsedTime;
            // Check time budget: reset if rotation animation is complete
            if (this.usedBudget > (1 + 350 / this.rotatorBudget)) {
                this.rotatorAnimation = false;
                this.usedBudget = 0;
            }
            else if (this.usedBudget > 1) {
                this.rotator.Angle = 0;
                // Else continue animation
            }
            else if (this.rotator.Angle != 0) {
                // Check what's closest: clockwise or counter-clockwise
                let angle = this.rotator.Angle;
                if (angle > Math.PI) {
                    // clockwise: increase angle
                    this.rotator.Angle = -this.rotatorDistance * (1 - easeInOut(this.usedBudget));
                }
                else {
                    // counter-clockwise: decrease angle
                    this.rotator.Angle = this.rotatorDistance * (1 - easeInOut(this.usedBudget));
                }
            }
            // Waterfall through animation segments: next reset angler
        }
        else if (this.anglerAnimation) {
            let elapsedTime = delta / this.anglerBudget;
            this.usedBudget += elapsedTime;
            // Check time budget: reset if angler animation is complete
            if (this.usedBudget > (1 + 350 / this.anglerBudget)) {
                this.anglerAnimation = false;
                this.usedBudget = 0;
                // Else continue animation
            }
            else if (this.angler.Position != 1) {
                let maxPos = this.angler.MaxFacets, pos = this.angler.Position;
                // Check what's closest: clockwise or counter-clockwise
                if (pos > maxPos) {
                    this.angler.Position = (2 * maxPos - 1) - Math.round(this.anglerDistance * (1 - this.usedBudget));
                }
                else {
                    this.angler.Position = Math.round(this.anglerDistance * (1 - this.usedBudget));
                }
            }
            // Waterfall through animation segments: finally switch images
        }
        else {
            let imageBudget = 700, elapsedTime = delta / imageBudget;
            if (!this.switchPlayed) {
                this.switchSound.play();
                this.switchPlayed = true;
            }
            this.usedBudget += elapsedTime;
            // Check time budget: reset if image animation is complete
            if (this.usedBudget > 1) {
                this.interactionAllowed = true;
                this.kaleidoscope.Translation = 0;
                this.resetting = false;
                document.body.style.cursor = "default";
                this.imageSelector.direction = -1;
            }
            else if (this.usedBudget > 0.5) {
                if (this.imageAnimation) {
                    this.imageSelector.Index += this.direction;
                    this.imageAnimation = false;
                }
                this.kaleidoscope.Translation = (1 - easeInOut(this.usedBudget)) * -2.2;
            }
            else {
                this.kaleidoscope.Translation = easeInOut(this.usedBudget) * -2.2;
            }
        }
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
                }
                else {
                    this.container.style.opacity = (this.runtime / this.startFade).toString();
                }
                break;
            case PhadePhase.Hold:
                if (this.resetting)
                    this.ResetAnimation(delta);
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
