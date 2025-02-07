import { AssetObject, IAlbum } from "../../Interfaces.js";
import { AssetArray } from "../../Assets.js";

export default class PhotoAlbum extends AssetArray<HTMLImageElement> {
    public readonly title: string;
    public readonly description: string;
    public readonly cover: string;
    public readonly index: number;

    constructor(album: IAlbum, index: number){
        const content: AssetObject<HTMLImageElement>[] = [];
        album.images.forEach((image) => {
            content.push({
                desc: image.desc,
                src: image.src,
                object : new Image()
            });
        });
        super(content);

        this.title = album.title;
        this.description = album.description;
        this.index = index;
        this.cover = (album.cover != "") ? album.cover : this.content[0].src;
    }
}