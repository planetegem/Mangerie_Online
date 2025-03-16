export var GameState;
(function (GameState) {
    GameState[GameState["Loading"] = 0] = "Loading";
    GameState[GameState["Welcome"] = 1] = "Welcome";
    GameState[GameState["Menu"] = 2] = "Menu";
    GameState[GameState["AlbumManager"] = 3] = "AlbumManager";
    GameState[GameState["Info"] = 4] = "Info";
    GameState[GameState["Titlecard"] = 5] = "Titlecard";
    GameState[GameState["Playing"] = 6] = "Playing";
    GameState[GameState["Tutorial"] = 7] = "Tutorial";
})(GameState || (GameState = {}));
export var PhadePhase;
(function (PhadePhase) {
    PhadePhase[PhadePhase["In"] = 1] = "In";
    PhadePhase[PhadePhase["Hold"] = 2] = "Hold";
    PhadePhase[PhadePhase["Out"] = 3] = "Out";
    PhadePhase[PhadePhase["Done"] = 4] = "Done";
})(PhadePhase || (PhadePhase = {}));
export var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["File01"] = "(*) nothing selected: either enter an external URL or upload an image from your hard drive";
    ErrorMessages["File02"] = "(*) can't select an empty URL field";
    ErrorMessages["File03"] = "(*) URL appears to be incorrect (couldn't load image)";
    ErrorMessages["File04"] = "(*) no file was uploaded";
    ErrorMessages["File05"] = "(*) something went wrong with FileReader - result was null";
    ErrorMessages["Album01"] = "(*) an album needs at least a title to be saved";
    ErrorMessages["Album01b"] = "(*) an album needs at least a description to be saved";
    ErrorMessages["Album02"] = "(*) an album needs at least one image to be valid";
    ErrorMessages["Album03"] = "(*) not all entries in the album are complete";
})(ErrorMessages || (ErrorMessages = {}));
