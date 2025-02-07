// PEEPHOLE IS WHERE IMAGE, ANGLE AND ROTATION ARE COMBINED
// I.E. WHAT YOU SEE THROUGH THE PEEPHOLE OF A KALEIDOSCOPE
export default class PeepHole {
    set Image(img) {
        this.image = img;
        this.CropImage();
    }
    set Angle(angle) {
        this.angle = angle;
    }
    get Angle() {
        return this.angle;
    }
    set Mirror(mirror) {
        this.facets = mirror;
        this.mirror = (2 * Math.PI) / Math.max(1, this.facets * 2 - 2);
    }
    set Translation(val) {
        this.translation = val;
    }
    // Constructor
    constructor(canvas, parent) {
        // Current base image used by the kaleidoscope
        this.image = new Image();
        // Angle of the image (rotated around center)
        this.angle = 0;
        // Angle of the mirrors (and amount of reflections)
        this.mirror = 2 * Math.PI;
        this.facets = 1;
        // Translation variable (used when switching images)
        this.translation = -1;
        // Geometry properties
        this.cWidth = 0;
        this.cHeight = 0;
        // Image cropping
        this.xMargin = 0;
        this.yMargin = 0;
        this.imgWidth = 0;
        this.imgHeight = 0;
        this.canvas = canvas;
        this.sketchCanvas = document.createElement("canvas");
        this.radius = parent.KaleidoscopeRadius;
        this.Resize();
    }
    // Reset all props to base values
    Reset() {
        this.angle = 0;
        this.mirror = 2 * Math.PI;
        this.facets = 1;
        this.translation = -1;
    }
    CropImage() {
        let width = this.image.naturalWidth, height = this.image.naturalHeight;
        if (width > height) {
            this.imgHeight = this.cHeight;
            this.imgWidth = this.cHeight * (width / height);
            this.xMargin = -(this.imgWidth - this.imgHeight) / 2;
            this.yMargin = 0;
        }
        else if (height > width) {
            this.imgWidth = this.cWidth;
            this.imgHeight = this.cWidth * (height / width);
            this.yMargin = -(this.imgHeight - this.imgWidth) / 2;
            this.xMargin = 0;
        }
        else {
            this.imgWidth = this.cWidth;
            this.imgHeight = this.cHeight;
            this.xMargin = 0;
            this.yMargin = 0;
        }
    }
    // Main functions
    Resize() {
        this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
        this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());
        this.cWidth = this.canvas.width;
        this.cHeight = this.canvas.height;
        this.sketchCanvas.setAttribute("width", this.cWidth.toString());
        this.sketchCanvas.setAttribute("height", this.cHeight.toString());
        this.CropImage();
    }
    Draw() {
        if (this.canvas === null) {
            throw "Error: attempting to draw when PeepHole canvas hasn't been set!";
        }
        else {
            const final = this.canvas.getContext("2d"), ctx = this.sketchCanvas.getContext("2d");
            if (ctx != null && final != null) {
                ctx.clearRect(0, 0, this.cWidth, this.cHeight);
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.cWidth * 0.5, this.cHeight * 0.5, this.cWidth * 0.5, 0 + Math.PI * 0.5, this.mirror + Math.PI * 0.5);
                ctx.lineTo(this.cWidth * 0.5, this.cHeight * 0.5);
                ctx.clip();
                ctx.translate(this.cWidth * 0.5, this.cHeight * 0.5);
                ctx.rotate(this.angle);
                ctx.translate(-this.cWidth * 0.5, -this.cHeight * 0.5);
                ctx.drawImage(this.image, this.xMargin, this.yMargin, this.imgWidth, this.imgHeight);
                ctx.restore();
                if (this.facets > 1) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(this.cWidth * 0.5, this.cHeight * 0.5, this.cWidth * 0.5, Math.PI * 0.5 - this.mirror, Math.PI * 0.5);
                    ctx.lineTo(this.cWidth * 0.5, this.cHeight * 0.5);
                    ctx.clip();
                    ctx.translate(this.cWidth * 0.5, this.cHeight * 0.5);
                    ctx.scale(-1, 1);
                    ctx.rotate(this.angle);
                    ctx.translate(-this.cWidth * 0.5, -this.cHeight * 0.5);
                    ctx.drawImage(this.image, this.xMargin, this.yMargin, this.imgWidth, this.imgHeight);
                    ctx.restore();
                }
                final.clearRect(0, 0, this.cWidth, this.cHeight);
                final.save();
                final.beginPath();
                final.arc(this.cWidth * 0.5, this.cHeight * 0.5, this.cWidth * this.radius, 0, Math.PI * 2);
                final.clip();
                final.fillStyle = "black";
                final.fillRect(0, 0, this.cWidth, this.cHeight);
                final.translate(this.cWidth * this.translation, 0);
                final.drawImage(this.sketchCanvas, this.cWidth * ((1 - this.radius * 2) * 0.5), this.cHeight * ((1 - this.radius * 2) * 0.5), this.cWidth * this.radius * 2, this.cHeight * this.radius * 2);
                for (let i = 0; i < this.facets - 1; i++) {
                    final.save();
                    final.translate(this.cWidth * 0.5, this.cHeight * 0.5);
                    final.rotate(this.mirror * 2 * i);
                    final.translate(-this.cWidth * 0.5, -this.cHeight * 0.5);
                    final.drawImage(this.sketchCanvas, this.cWidth * ((1 - this.radius * 2) * 0.5), this.cHeight * ((1 - this.radius * 2) * 0.5), this.cWidth * this.radius * 2, this.cHeight * this.radius * 2);
                    final.restore();
                }
                final.restore();
            }
            else {
                throw "Warning: PeepHole ctx failed";
            }
        }
    }
}
