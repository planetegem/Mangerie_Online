import { AssetArray } from "../../Assets.js";
export default class PhotoAlbum extends AssetArray {
    constructor(album, index) {
        const content = [];
        album.images.forEach((image) => {
            content.push({
                desc: image.desc,
                src: image.src,
                object: new Image()
            });
        });
        super(content);
        this.title = album.title;
        this.description = album.description;
        this.index = index;
        this.cover = (album.cover != "") ? album.cover : this.content[0].src;
    }
}
