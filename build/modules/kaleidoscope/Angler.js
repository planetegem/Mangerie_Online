import { Polygon, Point, getAngle } from "../Helpers.js";
export default class Angler {
    get MaxFacets() { return this.maxFacets; }
    get Position() {
        return this.position;
    }
    set Position(pos) {
        if (pos != this.position) {
            // Correct position for circularity
            let maxPos = this.maxFacets * 2 - 2;
            if (pos < 1) {
                this.position = maxPos;
            }
            else if (pos > maxPos) {
                this.position = 1;
            }
            else {
                this.position = pos;
            }
            // Get number of facets & new widget angle
            this.facets = this.position > this.maxFacets ? this.maxFacets * 2 - this.position : this.position;
            this.widgetAngle = this.angleInterval * (this.position - 1);
            this.widget.Rotate(this.widgetAngle);
            this.widgetCenter.Rotate(this.widgetAngle);
            this.dragWidget.Rotate(this.widgetAngle);
            // Pass facets to kaleidoscope
            this.kaleidoscope.Mirror = this.facets;
            // Play click sound
            this.clickSound.play();
        }
    }
    // Reset all props to base values
    Reset() {
        this.widgetAngle = 0;
        this.position = 1;
        this.facets = 1;
    }
    // Constructor
    constructor(canvas, kaleidoscope, parent, sound) {
        // Geometry & Interface
        this.cWidth = 0;
        this.cHeight = 0;
        this.widgetRadius = 0;
        this.outerRadius = 0;
        this.innerRadius = 0;
        this.dragging = false;
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
        this.dragWidget = this.MakeDragWidget();
    }
    MakeWidget() {
        let points = [];
        // Helper vars
        let centerX = this.cWidth * 0.5, centerY = this.cHeight * 0.5, width = this.parent.RotatorRadius * this.cWidth, baseY = centerY - this.innerRadius, circleStartY = baseY - width * 3.5, circleCenterY = circleStartY - width * 1.4;
        // Widget Handle
        points.push(new Point(centerX - width * 0.4, baseY, centerX, centerY));
        points.push(new Point(centerX - width * 0.4, circleStartY, centerX, centerY));
        points.push(new Point(centerX + width * 0.4, circleStartY, centerX, centerY));
        points.push(new Point(centerX + width * 0.4, baseY, centerX, centerY));
        // Widget circle
        this.widgetCenter = new Point(centerX, circleCenterY, centerX, centerY);
        this.widgetRadius = Math.sqrt(width * width * 0.25 + (circleStartY - circleCenterY) * (circleStartY - circleCenterY));
        return new Polygon(points);
    }
    MakeDragWidget() {
        let points = [];
        // Helper vars
        let centerX = this.cWidth * 0.5, centerY = this.cHeight * 0.5, cCenter = this.widgetCenter.y, cRadius = this.widgetRadius * 0.75, anchor = cRadius * 0.33;
        points.push(new Point(centerX, cCenter - cRadius, centerX, centerY));
        points.push(new Point(centerX - anchor, cCenter - anchor, centerX, centerY));
        points.push(new Point(centerX - cRadius, cCenter, centerX, centerY));
        points.push(new Point(centerX - anchor, cCenter + anchor, centerX, centerY));
        points.push(new Point(centerX, cCenter + cRadius, centerX, centerY));
        points.push(new Point(centerX + anchor, cCenter + anchor, centerX, centerY));
        points.push(new Point(centerX + cRadius, cCenter, centerX, centerY));
        points.push(new Point(centerX + anchor, cCenter - anchor, centerX, centerY));
        return new Polygon(points);
    }
    Resize() {
        // 1. Get true canvas size from css
        this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
        this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());
        this.cWidth = this.canvas.width;
        this.cHeight = this.canvas.height;
        // 2. Calculate radius of circle
        this.innerRadius = this.cWidth * this.parent.KaleidoscopeRadius;
        this.outerRadius = this.innerRadius + this.cWidth * this.parent.AnglerRadius * 1.1;
        // 3. Make arrow element
        this.widget = this.MakeWidget();
        this.dragWidget = this.MakeDragWidget();
    }
    // Interaction events
    Test(mouseX, mouseY) {
        let correctedX = mouseX - this.widgetCenter.x, correctedY = mouseY - this.widgetCenter.y, distance = Math.sqrt(correctedX * correctedX + correctedY * correctedY);
        return (distance <= this.widgetRadius) || this.widget.PNPOLY(mouseX, mouseY);
    }
    Press(mouseX, mouseY) {
        this.dragging = true;
    }
    Drag(mouseX, mouseY) {
        // First calculate and simplify angle
        let mouseAngle = getAngle(mouseX, mouseY, this.cWidth * 0.5, this.cHeight * 0.5) + Math.PI * 0.5;
        mouseAngle = mouseAngle >= Math.PI * 2 ? mouseAngle - Math.PI * 2 : mouseAngle;
        // Determine breaking point: distance needed to switch to next position
        let breakDistance = this.angleInterval * 0.66;
        // Separate logic if angle is 0
        if (this.widgetAngle == 0) {
            if (mouseAngle < Math.PI * 2 - breakDistance && mouseAngle > Math.PI - this.angleInterval) {
                this.Position--;
            }
            else if (mouseAngle > breakDistance && mouseAngle < this.angleInterval) {
                this.Position++;
            }
        }
        else if (mouseAngle > this.widgetAngle + breakDistance) {
            this.Position++;
        }
        else if (mouseAngle < this.widgetAngle - breakDistance) {
            this.Position--;
        }
    }
    Release() {
        this.dragging = false;
    }
    // Draw function: called every frame
    Draw() {
        if (this.canvas === null) {
            throw "Error: attempting to draw when Angler canvas hasn't been set!";
        }
        else {
            const ctx = this.canvas.getContext("2d");
            if (ctx != null) {
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
                if (this.dragging) {
                    ctx.beginPath();
                    ctx.fillStyle = "#395e5e";
                    ctx.moveTo(this.dragWidget.Points[0].x, this.dragWidget.Points[0].y);
                    for (let i = 1; i < this.dragWidget.Points.length; i++) {
                        ctx.lineTo(this.dragWidget.Points[i].x, this.dragWidget.Points[i].y);
                    }
                    ctx.fill();
                }
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.cWidth * 0.5, this.cHeight * 0.5, this.innerRadius, 0, 2 * Math.PI);
                ctx.clip();
                ctx.clearRect(0, 0, this.cWidth, this.cHeight);
                ctx.restore();
            }
            else {
                throw "Warning: Angler ctx failed";
            }
        }
    }
}
