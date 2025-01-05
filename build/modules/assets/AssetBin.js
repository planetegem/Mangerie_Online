// AssetBin is the basic container for all assets
// makes the loading counter an internal matter
// ... as it should be ...
export default class AssetBin {
    constructor(content) {
        this.content = content;
        this.loaded = 0;
    }
    UpdateLoad() {
        this.loaded++;
        return (this.loaded == this.content.size);
    }
}
