// AssetBox is the basic container for all assets
// makes the loading counter an internal matter
// ... as it should be ...
export class AssetBox {
    constructor(content) {
        // Loading logic: return true when all items are loaded
        this.loaded = 0;
        this.content = content;
        this.size = content.size;
    }
    Loaded() {
        this.loaded++;
        return (this.loaded == this.size);
    }
}
// Same principle, but now to load arrays
export class AssetList {
    constructor(content) {
        // Loading logic: return true when all items are loaded
        this.loaded = 0;
        this.content = content;
        this.size = content.length;
    }
    Loaded() {
        this.loaded++;
        return (this.loaded == this.size);
    }
}
