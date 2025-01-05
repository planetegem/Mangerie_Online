import AssetObject from "./AssetObject";

// AssetBox is the basic container for all assets
// makes the loading counter an internal matter
// ... as it should be ...

export class AssetBox<x> {
    // Assign content in constructor
    public readonly content: Map<string, AssetObject<x>>;
    private size: number;
    constructor (content: Map<string, AssetObject<x>>){
        this.content = content;
        this.size = content.size;
    }

    // Loading logic: return true when all items are loaded
    private loaded: number = 0;
    public Loaded(): boolean {
        this.loaded++;
        return (this.loaded == this.size);
    }
}

// Same principle, but now to load arrays
export class AssetList<x> {
    // Assign content in constructor
    public readonly content: AssetObject<x>[];
    private size: number;
    constructor (content: AssetObject<x>[]){
        this.content = content;
        this.size = content.length;
    }

    // Loading logic: return true when all items are loaded
    private loaded: number = 0;
    public Loaded(): boolean {
        this.loaded++;
        return (this.loaded == this.size);
    }
}