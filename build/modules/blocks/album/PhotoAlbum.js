import { AssetArray } from "../../Assets.js";
export default class PhotoAlbum extends AssetArray {
    constructor(album, baseAlbum, index = 0) {
        const content = [];
        album.images.forEach((image) => {
            var _a;
            content.push({
                desc: image.desc,
                src: image.src,
                object: new Image(),
                dataURL: (_a = image.dataURL) !== null && _a !== void 0 ? _a : undefined
            });
        });
        super(content);
        this.title = album.title;
        this.description = album.description;
        this.base = baseAlbum;
        this.index = index;
        // Some extra logic to select correct image as cover
        const firstImage = (this.content.length > 0) ?
            (this.content[0].dataURL && this.content[0].dataURL != "") ?
                this.content[0].dataURL :
                this.content[0].src :
            "assets/blank.webp";
        this.cover = (album.cover != "") ? album.cover : firstImage;
    }
}
