// Helper function: calculate angle based on cartesian coordinates
export function getAngle(x, y, centerX, centerY) {
    let xPos = x - centerX, yPos = centerY - y, angle = 0;
    if (xPos > 0 && yPos < 0) {
        angle = Math.atan(yPos / xPos) + 2 * Math.PI;
    }
    else if (xPos > 0) {
        angle = Math.atan(yPos / xPos);
    }
    else if (xPos < 0) {
        angle = Math.atan(yPos / xPos) + Math.PI;
    }
    else if (xPos === 0) {
        angle = y < 0 ? 1.5 * Math.PI : 0.5 * Math.PI;
    }
    angle = 2 * Math.PI - angle;
    return angle;
}
// Helper function: apply bezier ease-in-out to animation
// Credit: https://easings.net/#easeInOutSine
export function easeInOut(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
export class Point {
    // Constructor: get cartesian coordinates & calculate polar equivalent
    constructor(x, y, originX = 0, originY = 0) {
        // Polar coordinates
        this.angle = 0;
        this.starterAngle = 0;
        this.r = 0;
        this.x = x;
        this.y = y;
        this.originX = originX;
        this.originY = originY;
        this.GoPolar();
    }
    // Transform from cartesian to polar
    GoPolar() {
        // 1. Get distance from origin
        let newX = this.x - this.originX, newY = this.originY - this.y; // invert y-axis
        this.r = Math.sqrt(newX * newX + newY * newY);
        // 2. Get angle towards origin
        this.starterAngle = getAngle(this.x, this.y, this.originX, this.originY);
        this.angle = this.starterAngle;
    }
    // Transform from polar to cartesian
    GoCartesian() {
        this.x = this.r * Math.cos(this.angle) + this.originX;
        this.y = this.r * Math.sin(this.angle) + this.originY;
    }
    // Rotate coordinates around origin
    Rotate(angle) {
        this.angle = this.starterAngle + angle;
        this.GoCartesian();
    }
}
export class Polygon {
    get Points() {
        return this.points;
    }
    constructor(shape) {
        this.points = shape;
    }
    Rotate(addedAngle) {
        for (let point of this.points) {
            point.Rotate(addedAngle);
        }
    }
    // Test if point is inside polygon
    // Based on https://gist.github.com/joehonton/8e20db8cf52d6e545656ee4d59d1c650
    PNPOLY(x, y) {
        let intersect = false;
        let length = this.points.length;
        for (let i = 0, j = length - 1; i < length; j = i++) {
            const ix = this.points[i].x;
            const iy = this.points[i].y;
            const jx = this.points[j].x;
            const jy = this.points[j].y;
            if ((iy > y) != (jy > y)) {
                const intersectX = (jx - ix) * (y - iy) / (jy - iy) + ix;
                if (x < intersectX) {
                    intersect = !intersect;
                }
            }
        }
        return intersect;
    }
}
