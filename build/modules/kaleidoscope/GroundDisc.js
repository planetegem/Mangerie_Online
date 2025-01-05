import { easeInOut } from "../Helpers.js";
// GROUND DISC DECIDES THE IMAGE AT THE BASE OF THE KALEIDSCOPE
export default class GroundDisc {
    set Index(index) {
        let max = this.pictureBook.length - 1;
        if (index > max) {
            this.index = 0;
        }
        else if (index < 0) {
            this.index = max;
        }
        else {
            this.index = index;
        }
        this.kaleidoscope.Image = this.pictureBook[this.index].object;
        this.dialogLines = this.LineWrapper(this.pictureBook[this.index].desc);
    }
    get Index() { return this.index; }
    // Constructor
    constructor(canvas, kaleidoscope, pictureBook) {
        // Geometry & interface
        this.cWidth = 0;
        this.cHeight = 0;
        this.dWidth = 0;
        this.dHeight = 0;
        this.fontSize = 0;
        this.dialogLines = [];
        // Animation values
        this.translation = 1;
        this.direction = 0;
        this.canvas = canvas;
        this.kaleidoscope = kaleidoscope;
        this.pictureBook = pictureBook;
        this.index = 0;
        this.kaleidoscope.Image = this.pictureBook[this.index].object;
        this.Resize();
    }
    LineWrapper(str) {
        let lines = [], currentLine = "", words = str.split(" "), ctx = this.canvas.getContext("2d");
        if (ctx != null) {
            ctx.font = this.fontSize + "px Arial";
            for (let word of words) {
                let lineWidth = ctx.measureText(currentLine + " " + word).width;
                if (lineWidth >= this.dWidth - this.fontSize * 2.5) {
                    lines.push(currentLine);
                    currentLine = word;
                }
                else {
                    currentLine += currentLine.length > 0 ? " " + word : word;
                }
            }
            lines.push(currentLine);
        }
        this.dHeight = (lines.length + 2) * this.fontSize;
        return lines;
    }
    Resize() {
        // Get canvas size from css
        this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
        this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());
        this.cWidth = this.canvas.width;
        this.cHeight = this.canvas.height;
        // Get font size
        this.fontSize = Math.round(this.cHeight * 0.035);
        this.dWidth = this.cWidth * 0.68;
        this.dialogLines = this.LineWrapper(this.pictureBook[this.index].desc);
    }
    set Translation(val) {
        if (val >= 1 || val <= 0) {
            this.direction = 0;
        }
        this.translation = Math.min(1, Math.max(0, val));
    }
    get Translation() { return this.translation; }
    // Draw function: called every frame
    Draw() {
        if (this.canvas === null) {
            throw "Error: attempting to draw when GroundDisc canvas hasn't been set!";
        }
        else {
            const ctx = this.canvas.getContext("2d"), leftOffset = (this.cWidth - this.dWidth) * 0.5, topOffset = this.cHeight - this.dHeight;
            if (ctx != null) {
                this.Translation += 0.035 * this.direction;
                ctx.clearRect(0, 0, this.cWidth, this.cHeight);
                ctx.translate(0, this.dHeight * easeInOut(this.translation));
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = "black";
                ctx.fillRect(leftOffset - this.fontSize * 0.1, topOffset - this.fontSize * 0.1, this.dWidth + this.fontSize * 0.2, this.dHeight + this.fontSize * 0.1);
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#2f4f4f";
                ctx.fillRect(leftOffset, topOffset, this.dWidth, this.dHeight);
                ctx.fillStyle = "white";
                ctx.fillRect(leftOffset + this.fontSize * 0.5, topOffset + this.fontSize * 0.5, this.dWidth - this.fontSize, this.dHeight - this.fontSize * 0.5);
                ctx.font = this.fontSize + "px Arial";
                ctx.fillStyle = "black";
                for (let i = 0; i < this.dialogLines.length; i++) {
                    let cOffset = (this.dWidth - ctx.measureText(this.dialogLines[i]).width) * 0.5;
                    ctx.fillText(this.dialogLines[i], leftOffset + cOffset, topOffset + this.fontSize * (i + 2));
                }
                ctx.translate(0, -this.dHeight * easeInOut(this.translation));
            }
            else {
                throw "Warning: GroundDisc ctx failed";
            }
        }
    }
}
