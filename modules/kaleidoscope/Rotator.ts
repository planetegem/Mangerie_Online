import { Point, Polygon, getAngle } from "../Helpers.js";
import Kaleidoscope from "./PeepHole.js";
import { InteractiveModule } from "../Interfaces.js";
import Mangerie from "./Kaleidoscope.js";

export default class Rotator implements InteractiveModule {
    // Main modules
    private parent: Mangerie;
    private canvas: HTMLCanvasElement;
    private kaleidoscope: Kaleidoscope;

    // Main logic: applies rotation to kaleidoscope image
    private angle: number = 0;
    public get Angle(): number { return this.angle; }
    public set Angle(val: number) {
        this.angle = val;
        
        // Normalize angle
        this.angle = this.angle % (Math.PI * 2); 
        this.angle = this.angle < 0 ? Math.PI * 2 + this.angle : this.angle;

        // Apply angle
        this.widget.Rotate(this.angle);
        this.kaleidoscope.Angle = this.angle;
        this.PlaySound();
    }
    // Reset all props to base values
    public Reset():void {
        this.angle = 0;
        this.circleWidth = this.parent.RotatorRadius;
    }

    // Constructor
    constructor (canvas: HTMLCanvasElement, kaleidoscope: Kaleidoscope, parent: Mangerie, sounds: HTMLAudioElement[]){
        this.parent = parent;
        this.circleWidth = parent.RotatorRadius
        this.kaleidoscope = kaleidoscope;
        this.canvas = canvas;

        this.Resize();
        this.widget = this.MakeWidget();
        this.sounds = sounds;
    }

    // Audio: play random tick when turning
    private sounds: HTMLAudioElement[];
    private lastClick: number = 0;
    private threshold: number = Math.PI / 60; // click every 3 degrees

    private PlaySound(){
        let dist: number = Math.abs(this.angle - this.lastClick);

        // skip beat when passing 0
        if (dist > Math.PI){
            this.lastClick = this.angle;
        } else if (dist > this.threshold){
            this.lastClick = this.angle;

            let rnd: number = Math.floor(Math.random() * this.sounds.length);
            this.sounds[rnd].play();
        }
    }

     // Geometry & Interface elements
     private widget: Polygon;
     private circleWidth: number;
     private cWidth: number = 0;
     private cHeight: number = 0;
     private outerRadius: number = 0;
     private innerRadius: number = 0;
     private startAngle: number = 0;
     private clickedAngle: number = 0;

     private MakeWidget(): Polygon {
        let points: Point[] = [];

        // HELPER VARS
        let centerX = this.cWidth * 0.5, centerY = this.cHeight * 0.5,
            width = this.circleWidth * this.cWidth,
            baseX = width * 1.5, baseY = centerY - this.innerRadius,
            arrowY = baseY - width * 2.5, arrowX = baseX * 3,
            arrowWidth = baseX;

        // LEFT ARROW
        points.push(new Point(centerX - baseX, baseY, centerX, centerY));
        points.push(new Point(centerX - baseX, arrowY + width * 0.5, centerX, centerY));
        points.push(new Point(centerX - (arrowX - arrowWidth), arrowY + width * 0.5, centerX, centerY));
        points.push(new Point(centerX - (arrowX - arrowWidth), arrowY + width, centerX, centerY));
        points.push(new Point(centerX - arrowX, arrowY, centerX, centerY));
        points.push(new Point(centerX - (arrowX - arrowWidth), arrowY - width, centerX, centerY));
        points.push(new Point(centerX - (arrowX - arrowWidth), arrowY - width * 0.5, centerX, centerY));
        points.push(new Point(centerX - (baseX - width), arrowY - width * 0.5, centerX, centerY));
        points.push(new Point(centerX - (baseX - width), baseY, centerX, centerY));
        
        // RIGHT ARROW
        points.push(new Point(centerX + (baseX - width), baseY, centerX, centerY));
        points.push(new Point(centerX + (baseX - width), arrowY - width * 0.5, centerX, centerY));
        points.push(new Point(centerX + (arrowX - arrowWidth), arrowY - width * 0.5, centerX, centerY));
        points.push(new Point(centerX + (arrowX - arrowWidth), arrowY - width, centerX, centerY));
        points.push(new Point(centerX + arrowX, arrowY, centerX, centerY));
        points.push(new Point(centerX + (arrowX - arrowWidth), arrowY + width, centerX, centerY));
        points.push(new Point(centerX + (arrowX - arrowWidth), arrowY + width * 0.5, centerX, centerY));
        points.push(new Point(centerX + baseX, arrowY + width * 0.5, centerX, centerY));
        points.push(new Point(centerX + baseX, baseY, centerX, centerY));

        return new Polygon(points);
    }
    
    public Resize(): void {
        // 1. Get true canvas size from css
        this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
        this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());
        this.cWidth = this.canvas.width;
        this.cHeight = this.canvas.height;

        // 2. Calculate radius of circle
        this.innerRadius = this.cWidth * this.parent.KaleidoscopeRadius + this.cWidth * this.parent.AnglerRadius;
        this.outerRadius = this.innerRadius + this.cWidth * this.circleWidth;

        // 3. Make arrow element
        this.circleWidth = this.parent.RotatorRadius;
        this.widget = this.MakeWidget();
    }
    
    // Interaction events
    public Test(mouseX: number, mouseY: number): boolean {
        let correctedX = mouseX - this.cWidth * 0.5, correctedY = mouseY - this.cHeight * 0.5,
            distance = Math.sqrt(correctedX * correctedX + correctedY * correctedY);

        return (distance <= this.outerRadius && distance >= this.innerRadius) || this.widget.PNPOLY(mouseX, mouseY);
    }
    public Press(mouseX: number, mouseY: number): void {
        this.clickedAngle = getAngle(mouseX, mouseY, this.cWidth * 0.5, this.cHeight * 0.5);
        this.startAngle = this.angle;
    }
    public Drag(mouseX: number, mouseY: number): void {
        let diff = getAngle(mouseX, mouseY, this.cWidth * 0.5, this.cHeight * 0.5) - this.clickedAngle;
        this.Angle = this.startAngle + diff;
    }
    public Release(): void {}

    // Draw function: called every frame
    public Draw(): void {
        if (this.canvas === null){
            throw "Error: attempting to draw when rotator canvas hasn't been set!";

        } else {
            const ctx = this.canvas.getContext("2d");

            if (ctx != null){
                ctx.clearRect(0, 0, this.cWidth, this.cHeight);
                ctx.beginPath();
                ctx.fillStyle = "#395e5e";
                ctx.globalAlpha = 1;
                ctx.arc(this.cWidth * 0.5, this.cHeight * 0.5, this.outerRadius, 0, 2 * Math.PI);
                ctx.moveTo(this.widget.Points[0].x, this.widget.Points[0].y);
                for (let i = 1; i < this.widget.Points.length; i++) {
                    ctx.lineTo(this.widget.Points[i].x, this.widget.Points[i].y);
                }
                ctx.fill();

                // Clear center
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.cWidth * 0.5, this.cHeight * 0.5, this.innerRadius, 0, 2 * Math.PI);
                ctx.clip();
                ctx.clearRect(0, 0, this.cWidth, this.cHeight);
                ctx.restore();
            } else {
                throw "Warning: Rotator ctx failed";
            }
        }
    }
}