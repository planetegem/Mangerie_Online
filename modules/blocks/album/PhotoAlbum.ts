import { AssetObject, IAlbum } from "../../Interfaces.js";
import { AssetArray } from "../../Assets.js";

export default class PhotoAlbum extends AssetArray<HTMLImageElement> {
    public title: string;
    public description: string;
    public cover: string;
    public index: number;
    public readonly base: boolean;

    constructor(album: IAlbum, baseAlbum: boolean, index: number = 0){
        const content: AssetObject<HTMLImageElement>[] = [];
        album.images.forEach((image) => {
            content.push({
                desc: image.desc,
                src: image.src,
                object : new Image(),
                dataURL: image.dataURL ?? undefined
            });
        });
        super(content);

        this.title = album.title;
        this.description = album.description;
        this.base = baseAlbum;
        this.index = index;
        
        // Some extra logic to select correct image as cover
        const firstImage: string = 
            (this.content.length > 0) ? 
                (this.content[0].dataURL && this.content[0].dataURL != "") ? 
                    this.content[0].dataURL : 
                    this.content[0].src : 
                "assets/blank.webp";
        this.cover = (album.cover != "") ? album.cover : firstImage;
    }
}