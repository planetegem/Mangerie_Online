import { StandardModule } from "modules/Interfaces.js";
import Mangerie from "./Mangerie";

export default class Kaleidoscope implements StandardModule{
    // Canvas elements: sketchCanvas is used to make temporary image components (for easier transformations)
    private canvas: HTMLCanvasElement;
    private sketchCanvas: HTMLCanvasElement;
    private parent: Mangerie;

    // Current base image used by the kaleidoscope
    private image: HTMLImageElement = new Image();
    public set Image(img: HTMLImageElement){
        this.image = img;
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
        this.parent = parent;
        this.canvas = canvas;
        this.sketchCanvas = document.createElement("canvas");
        this.radius = parent.kaleidoscopeRadius;
        this.Resize();
    }

    // Geometry properties
    private cWidth: number = 0;
    private cHeight: number = 0;
    private radius: number;

    // Main functions
    public Resize(): void {
        this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
        this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());
        this.cWidth = this.canvas.width;
        this.cHeight = this.canvas.height;
        this.sketchCanvas.setAttribute("width", this.cWidth.toString());
        this.sketchCanvas.setAttribute("height", this.cHeight.toString());
    }
    public Draw(): void {
        if (this.canvas === null){
            throw "Error: attempting to draw when Kaleidoscope canvas hasn't been set!";
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
                ctx.drawImage(this.image, 0, 0, this.cWidth, this.cHeight);
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
                    ctx.drawImage(this.image, 0, 0, this.cWidth, this.cHeight);
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
                throw "Warning: Kaleidoscope ctx failed";
            }
        }
    }
}