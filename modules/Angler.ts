import { Polygon, Point, getAngle } from "./Geometry.js";
import Kaleidoscope from "./Kaleidoscope.js";
import { InteractiveModule } from "./Interfaces.js";
import Mangerie from "./Mangerie.js";

export default class Angler implements InteractiveModule {
    // Main modules
    private parent: Mangerie;
    private canvas: HTMLCanvasElement;
    private kaleidoscope: Kaleidoscope;

    // Sound effects
    private clickSound: HTMLAudioElement;

    // Main logic: apply mirror angle & amount of reflections to kaleidoscope
    private maxFacets: number;
    public get MaxFacets(): number { return this.maxFacets; }
    private facets: number;
    private widgetAngle: number;
    private angleInterval: number;
    private position: number;
    public get Position(): number {
        return this.position;
    }
    public set Position(pos: number){
        if (pos != this.position){
            // Correct position for circularity
            let maxPos = this.maxFacets * 2 - 2;
            if (pos < 1){
                this.position = maxPos;
            } else if (pos > maxPos){
                this.position = 1;
            } else {
                this.position = pos;
            }

            // Get number of facets & new widget angle
            this.facets = this.position > this.maxFacets ? this.maxFacets * 2 - this.position : this. position;
            this.widgetAngle = this.angleInterval * (this.position - 1);
            this.widget.Rotate(this.widgetAngle);
            this.widgetCenter.Rotate(this.widgetAngle);

            // Pass facets to kaleidoscope
            this.kaleidoscope.Mirror = this.facets;

            // Play click sound
            this.clickSound.play();
        }
    }

    // Constructor
    constructor(canvas: HTMLCanvasElement, kaleidoscope: Kaleidoscope, parent: Mangerie, sound: HTMLAudioElement){
        this.parent = parent;
        this.canvas = canvas;
        this.kaleidoscope = kaleidoscope;
        this.clickSound = sound;
        this.widgetCenter = new Point(0, 0);

        this.widgetAngle = 0;
        this.position = 1;
        this.facets = 1;
        this.maxFacets = 8;
        this.angleInterval = Math.PI / Math.max(1, this.maxFacets - 1);
        
        this.Resize();
        this.widget = this.MakeWidget();
    }

    // Geometry & Interface
    private cWidth: number = 0;
    private cHeight: number = 0;
    private widget: Polygon;
    private widgetCenter: Point;
    private widgetRadius: number = 0;
    private outerRadius: number = 0;
    private innerRadius: number = 0;

    private MakeWidget(): Polygon {
        let cWidth: number = this.canvas.width, cHeight: number = this.canvas.height,
            centerX: number = cWidth * 0.5, centerY: number = cHeight * 0.5,
            points: Point[] = [];

        // Helper vars (eases reactive design)
        let var1: number = cWidth * this.parent.rotatorRadius * 0.8,
            var2: number = cWidth * this.parent.rotatorRadius,
            var3: number = var2 * (17/6);

        points.push(new Point(centerX - var1 * 0.5, centerY - this.innerRadius, centerX, centerY));
        points.push(new Point(centerX - var1 * 0.5, centerY - (this.outerRadius + var2 * 2), centerX, centerY));
        points.push(new Point(centerX + var1 * 0.5, centerY - (this.outerRadius + var2 * 2), centerX, centerY));
        points.push(new Point(centerX + var1 * 0.5, centerY - this.innerRadius, centerX, centerY));

        // Widget circle
        this.widgetCenter = new Point(centerX, centerY - (this.outerRadius + var2 + var3), centerX, centerY);
        this.widgetRadius = var2 * 1.9;

        return new Polygon(points);
    }

    public Resize(): void {
        // 1. Get true canvas size from css
        this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
        this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());
        this.cWidth = this.canvas.width;
        this.cHeight = this.canvas.height;

        // 2. Calculate radius of circle
        this.innerRadius = this.cWidth * this.parent.kaleidoscopeRadius;
        this.outerRadius = this.innerRadius + this.cWidth * this.parent.anglerRadius * 1.1;

        // 3. Make arrow element
        this.widget = this.MakeWidget();
    }

    // Interaction events
    public Test(mouseX: number, mouseY: number): boolean {
        let correctedX = mouseX - this.widgetCenter.x, correctedY = mouseY - this.widgetCenter.y,
            distance = Math.sqrt(correctedX * correctedX + correctedY * correctedY);

        return (distance <= this.widgetRadius) || this.widget.PNPOLY(mouseX, mouseY);
    }
    public Press(mouseX: number, mouseY: number): void {}
    public Drag(mouseX: number, mouseY: number): void {
        // First calculate and simplify angle
        let mouseAngle = getAngle(mouseX, mouseY, this.cWidth * 0.5, this.cHeight * 0.5) + Math.PI * 0.5;
        mouseAngle = mouseAngle >= Math.PI * 2 ? mouseAngle - Math.PI * 2 : mouseAngle;

        // Determine breaking point: distance needed to switch to next position
        let breakDistance = this.angleInterval * 0.66;
        
        // Separate logic if angle is 0
        if (this.widgetAngle == 0){
            if (mouseAngle < Math.PI * 2 - breakDistance && mouseAngle > Math.PI - this.angleInterval){
                this.Position--;
            } else if (mouseAngle > breakDistance && mouseAngle < this.angleInterval){
                this.Position++;
            }       
        
        } else if (mouseAngle > this.widgetAngle + breakDistance){
            this.Position++;
        } else if (mouseAngle < this.widgetAngle - breakDistance){
            this.Position--;
        }
    }
    public Release(): void {}

    // Draw function: called every frame
    public Draw(): void {
        if (this.canvas === null){
            throw "Error: attempting to draw when Angler canvas hasn't been set!";

        } else {
            const ctx = this.canvas.getContext("2d");

            if (ctx != null){
                ctx.clearRect(0, 0, this.cWidth, this.cHeight);
                ctx.save();

                ctx.beginPath();
                ctx.arc(this.cWidth * 0.5, this.cHeight * 0.5, this.outerRadius, 0, 2 * Math.PI);
                ctx.fillStyle = "#2f4f4f";
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(this.widget.Points[0].x, this.widget.Points[0].y);
                for (let i = 1; i < this.widget.Points.length; i++) {
                    ctx.lineTo(this.widget.Points[i].x, this.widget.Points[i].y);
                }
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.widgetCenter.x, this.widgetCenter.y, this.widgetRadius, 0, Math.PI * 2);
                ctx.fill();
            
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.cWidth * 0.5, this.cHeight * 0.5, this.innerRadius, 0, 2 * Math.PI);
                ctx.clip();
                ctx.clearRect(0, 0, this.cWidth, this.cHeight);
                ctx.restore();
            } else {
                throw "Warning: Angler ctx failed";
            }
        }
    }
}