import { Point, Polygon, getAngle } from "../Helpers.js";
export default class Rotator {
    get Angle() { return this.angle; }
    set Angle(val) {
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
    Reset() {
        this.angle = 0;
        this.circleWidth = this.parent.RotatorRadius;
    }
    // Constructor
    constructor(canvas, kaleidoscope, parent, sounds) {
        // Main logic: applies rotation to kaleidoscope image
        this.angle = 0;
        this.lastClick = 0;
        this.threshold = Math.PI / 60; // click every 3 degrees
        this.cWidth = 0;
        this.cHeight = 0;
        this.outerRadius = 0;
        this.innerRadius = 0;
        this.startAngle = 0;
        this.clickedAngle = 0;
        this.parent = parent;
        this.circleWidth = parent.RotatorRadius;
        this.kaleidoscope = kaleidoscope;
        this.canvas = canvas;
        this.Resize();
        this.widget = this.MakeWidget();
        this.sounds = sounds;
    }
    PlaySound() {
        let dist = Math.abs(this.angle - this.lastClick);
        // skip beat when passing 0
        if (dist > Math.PI) {
            this.lastClick = this.angle;
        }
        else if (dist > this.threshold) {
            this.lastClick = this.angle;
            let rnd = Math.floor(Math.random() * this.sounds.length);
            this.sounds[rnd].play();
        }
    }
    MakeWidget() {
        let points = [];
        // HELPER VARS
        let centerX = this.cWidth * 0.5, centerY = this.cHeight * 0.5, width = this.circleWidth * this.cWidth, baseX = width * 1.5, baseY = centerY - this.innerRadius, arrowY = baseY - width * 2.5, arrowX = baseX * 3, arrowWidth = baseX;
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
    Resize() {
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
    Test(mouseX, mouseY) {
        let correctedX = mouseX - this.cWidth * 0.5, correctedY = mouseY - this.cHeight * 0.5, distance = Math.sqrt(correctedX * correctedX + correctedY * correctedY);
        return (distance <= this.outerRadius && distance >= this.innerRadius) || this.widget.PNPOLY(mouseX, mouseY);
    }
    Press(mouseX, mouseY) {
        this.clickedAngle = getAngle(mouseX, mouseY, this.cWidth * 0.5, this.cHeight * 0.5);
        this.startAngle = this.angle;
    }
    Drag(mouseX, mouseY) {
        let diff = getAngle(mouseX, mouseY, this.cWidth * 0.5, this.cHeight * 0.5) - this.clickedAngle;
        this.Angle = this.startAngle + diff;
    }
    Release() { }
    // Draw function: called every frame
    Draw() {
        if (this.canvas === null) {
            throw "Error: attempting to draw when rotator canvas hasn't been set!";
        }
        else {
            const ctx = this.canvas.getContext("2d");
            if (ctx != null) {
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
            }
            else {
                throw "Warning: Rotator ctx failed";
            }
        }
    }
}
