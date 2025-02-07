import { PhadePhase } from "./Enums.js";

export interface StandardModule {
    Draw(): void;
    Resize(): void;
    Reset(): void;
}
export interface InteractiveModule extends StandardModule {
    Release(): void;
    Press(mouseX: number, mouseY: number): void;
    Drag(mouseX: number, mouseY: number): void;
    Test(mouseX: number, mouseY: number): boolean;
}
export interface Dragger {
    active: boolean;
    object: InteractiveModule | null;
}
export interface Block {
    Enable(full?: boolean): void;
    Update(delta: number): PhadePhase;
    Disable(full?: boolean): void;
}

// GENERALIZED ASSET OBJECT
// contains fields for description, source and preloaded HTML object
export interface AssetObject<x> {
    desc: string;
    src: string;
    object: x;
}

export interface IAlbum {
    title: string;
    description: string;
    cover: string;
    images: {desc: string; src: string}[];
}