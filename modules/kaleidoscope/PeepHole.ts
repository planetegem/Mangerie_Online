import { StandardModule } from "modules/Interfaces.js";
import Mangerie from "./Kaleidoscope.js";

// PEEPHOLE IS WHERE IMAGE, ANGLE AND ROTATION ARE COMBINED
// I.E. WHAT YOU SEE THROUGH THE PEEPHOLE OF A KALEIDOSCOPE

export default class PeepHole implements StandardModule{
    // Canvas elements: sketchCanvas is used to make temporary image components (for easier transformations)
    private canvas: HTMLCanvasElement;
    private sketchCanvas: HTMLCanvasElement;

    // Current base image used by the kaleidoscope
    private image: HTMLImageElement = new Image();
    public set Image(img: HTMLImageElement){
        this.image = img;
        this.CropImage();
    }

    // Angle of the image (rotated around center)
    private angle: number = 0;
    public set Angle(angle: number){
        this.angle = angle;
    }
    public get Angle(): number {
        return this.angle;
    }

    // Angle of the mirrors (and amount of reflections)
    private mirror: number = 2 * Math.PI;
    private facets: number = 1;
    public set Mirror(mirror: number){
        this.facets = mirror;
        this.mirror = (2 * Math.PI) / Math.max(1, this.facets * 2 - 2);
    }

    // Translation variable (used when switching images)
    private translation: number = -1;
    public set Translation(val: number){
        this.translation = val;
    }
    
    // Constructor
    constructor(canvas: HTMLCanvasElement, parent: Mangerie){
        this.canvas = canvas;
        this.sketchCanvas = document.createElement("canvas");
        this.radius = parent.KaleidoscopeRadius;
        this.Resize();
    }

    // Geometry properties
    private cWidth: number = 0;
    private cHeight: number = 0;
    private radius: number;

    // Reset all props to base values
    public Reset():void {
        this.angle = 0;
        this.mirror = 2 * Math.PI;
        this.facets = 1;
        this.translation = -1;
    }

    // Image cropping
    private xMargin: number = 0;
    private yMargin: number = 0;
    private imgWidth: number = 0;
    private imgHeight: number = 0;

    private CropImage(): void {
        let width: number = this.image.naturalWidth, height: number = this.image.naturalHeight;

        if (width > height){
            this.imgHeight = this.cHeight;
            this.imgWidth = this.cHeight * (width / height);
            this.xMargin = -(this.imgWidth - this.imgHeight) / 2;
            this.yMargin = 0;            

        } else if (height > width){
            this.imgWidth = this.cWidth;
            this.imgHeight = this.cWidth * (height / width);
            this.yMargin = -(this.imgHeight - this.imgWidth) / 2;
            this.xMargin = 0;

        } else {
            this.imgWidth = this.cWidth;
            this.imgHeight = this.cHeight;
            this.xMargin = 0; this.yMargin = 0;
        }

    }

    // Main functions
    public Resize(): void {
        this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
        this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());
        this.cWidth = this.canvas.width;
        this.cHeight = this.canvas.height;
        this.sketchCanvas.setAttribute("width", this.cWidth.toString());
        this.sketchCanvas.setAttribute("height", this.cHeight.toString());
        this.CropImage();
    }
    public Draw(): void {
        if (this.canvas === null){
            throw "Error: attempting to draw when PeepHole canvas hasn't been set!";
        } else {
            const final = this.canvas.getContext("2d"),
                  ctx = this.sketchCanvas.getContext("2d");
        
            if (ctx != null && final != null){
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

                if (this.facets > 1){
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
                for (let i = 0; i < this.facets - 1; i++){
                    final.save();
                    final.translate(this.cWidth * 0.5, this.cHeight * 0.5);
                    final.rotate(this.mirror * 2 * i);                   
                    final.translate(-this.cWidth * 0.5, -this.cHeight * 0.5);
                    final.drawImage(this.sketchCanvas, this.cWidth * ((1 - this.radius * 2) * 0.5), this.cHeight * ((1 - this.radius * 2) * 0.5), this.cWidth * this.radius * 2, this.cHeight * this.radius * 2);
                    final.restore();
                }
                final.restore();
                
            } else {
                throw "Warning: PeepHole ctx failed";
            }
        }
    }
}