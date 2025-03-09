export enum GameState {
    Loading = 0,
    Welcome,
    Menu,
    AlbumManager,
    Info,
    Titlecard,
    Playing,
    Tutorial
}
export enum PhadePhase {
    In = 1,
    Hold = 2,
    Out = 3,
    Done = 4
}
export enum ErrorMessages {
    File01 = "(*) nothing selected: either enter an external URL or upload an image from your hard drive",
    File02 = "(*) can't select an empty URL field",
    File03 = "(*) URL appears to be incorrect (couldn't load image)",
    File04 = "(*) no file was uploaded",
    File05 = "(*) something went wrong with FileReader - result was null",
    Album01 = "(*) an album needs at least a title and description to be saved",
    Album02 = "(*) an album needs at least one image to be valid",
    Album03 = "(*) not all entries in the album are complete"
}