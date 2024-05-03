export interface StandardModule {
    Draw(): void;
    Resize(): void;
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