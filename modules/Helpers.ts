import { IAlbum } from "./Interfaces.js";

// Helper function: fit image into square canvas
export function FitImage(imgWidth: number, imgHeight: number, canvas: HTMLCanvasElement) : [number, number, number, number] {
    const cWidth: number = canvas.offsetWidth, cHeight = canvas.offsetHeight;
    
    let width: number = cWidth, height: number = cHeight,
        marginX: number = 0, marginY: number = 0;

    if (imgWidth > imgHeight){
        width = height * (imgWidth / imgHeight);
        marginX = -(width - height) / 2;

    } else if (imgHeight > imgWidth){
        height = width * (imgHeight / imgWidth);
        marginY = -(height - width) / 2;

    } 
    
    return [width, height, marginX, marginY];
}


// Helper function: fetch photo album from json
export async function getJSON(path: string): Promise<IAlbum | null>{
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`JSON response not ok for ${path}`);

        const json : Promise<IAlbum> = await response.json();
        return json;
    } catch(error) { 
        console.log(error); 
        return null;
    }
}

// Helper function: calculate angle based on cartesian coordinates
export function getAngle(x: number, y: number, centerX: number, centerY: number): number {
    let xPos: number = x - centerX,
        yPos: number = centerY - y,
        angle: number = 0;
    
    if (xPos > 0 && yPos < 0){
        angle = Math.atan(yPos/xPos) + 2*Math.PI;
    } else if (xPos > 0){
        angle = Math.atan(yPos/xPos);
    } else if (xPos < 0){
        angle = Math.atan(yPos/xPos) + Math.PI;
    } else if (xPos === 0){
        angle = y < 0 ? 1.5*Math.PI : 0.5*Math.PI;
    }
    angle = 2*Math.PI - angle;
    return angle;
}

// Helper function: apply bezier ease-in-out to animation
// Credit: https://easings.net/#easeInOutSine
export function easeInOut(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Helper class for geometry
export class Point {
    // Cartesian coordinates
    public x: number;
    public y: number;

    // Polar coordinates
    public angle: number = 0;
    public starterAngle: number = 0;
    public r: number = 0;
    public originX: number;
    public originY: number;

    // Constructor: get cartesian coordinates & calculate polar equivalent
    constructor(x: number, y: number, originX: number = 0, originY: number = 0){
        this.x = x;
        this.y = y;
        this.originX = originX;
        this.originY = originY;

        this.GoPolar();
    }

    // Transform from cartesian to polar
    public GoPolar(): void {
        // 1. Get distance from origin
        let newX = this.x - this.originX,
            newY = this.originY - this.y; // invert y-axis
        this.r = Math.sqrt(newX * newX + newY * newY);

        // 2. Get angle towards origin
        this.starterAngle = getAngle(this.x, this.y, this.originX, this.originY);
        this.angle = this.starterAngle;
    }

    // Transform from polar to cartesian
    public GoCartesian(): void {
        this.x = this.r * Math.cos(this.angle) + this.originX;
        this.y = this.r * Math.sin(this.angle) + this.originY;
    }

    // Rotate coordinates around origin
    public Rotate(angle: number): void {
        this.angle = this.starterAngle + angle;
        this.GoCartesian();
    }
}

// Helper class for geometry
export class Polygon {
    private points: Point[];
    public get Points(): Point[] {
        return this.points;
    }

    constructor(shape: Point[]){
        this.points = shape;
    }

    public Rotate(addedAngle: number){
        for (let point of this.points){
            point.Rotate(addedAngle);
        }
    }

    // Test if point is inside polygon
    // Based on https://gist.github.com/joehonton/8e20db8cf52d6e545656ee4d59d1c650
    public PNPOLY(x: number, y: number): boolean {
        let intersect: boolean = false;
        let length: number = this.points.length;

        for (let i = 0, j = length -1; i < length; j = i++){
            const ix = this.points[i].x;
            const iy = this.points[i].y;
            const jx = this.points[j].x;
            const jy = this.points[j].y;

            if ((iy > y) != (jy > y)) {
                const intersectX = (jx - ix) * (y - iy) / (jy - iy) + ix;
                if (x < intersectX){
                    intersect = !intersect;
                }
            }       
        }
        return intersect;
    }
}