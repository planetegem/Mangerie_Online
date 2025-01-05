// Generalized asset object
// contains fields for description, source and preloaded HTML object

export default interface AssetObject<x> {
    desc: string;
    src: string;
    object: x;
}
