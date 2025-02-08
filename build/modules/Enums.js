export var GameState;
(function (GameState) {
    GameState[GameState["Loading"] = 0] = "Loading";
    GameState[GameState["Welcome"] = 1] = "Welcome";
    GameState[GameState["Menu"] = 2] = "Menu";
    GameState[GameState["AlbumSelection"] = 3] = "AlbumSelection";
    GameState[GameState["AlbumCreation"] = 4] = "AlbumCreation";
    GameState[GameState["Info"] = 5] = "Info";
    GameState[GameState["Titlecard"] = 6] = "Titlecard";
    GameState[GameState["Playing"] = 7] = "Playing";
    GameState[GameState["Tutorial"] = 8] = "Tutorial";
})(GameState || (GameState = {}));
export var PhadePhase;
(function (PhadePhase) {
    PhadePhase[PhadePhase["In"] = 1] = "In";
    PhadePhase[PhadePhase["Hold"] = 2] = "Hold";
    PhadePhase[PhadePhase["Out"] = 3] = "Out";
    PhadePhase[PhadePhase["Done"] = 4] = "Done";
})(PhadePhase || (PhadePhase = {}));
