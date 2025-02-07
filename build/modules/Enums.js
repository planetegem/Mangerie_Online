export var GameState;
(function (GameState) {
    GameState[GameState["Loading"] = 0] = "Loading";
    GameState[GameState["Welcome"] = 1] = "Welcome";
    GameState[GameState["Menu"] = 2] = "Menu";
    GameState[GameState["Album"] = 3] = "Album";
    GameState[GameState["Info"] = 4] = "Info";
    GameState[GameState["Titlecard"] = 5] = "Titlecard";
    GameState[GameState["StartGame"] = 6] = "StartGame";
    GameState[GameState["Tutorial"] = 7] = "Tutorial";
    GameState[GameState["Playing"] = 8] = "Playing";
})(GameState || (GameState = {}));
export var PhadePhase;
(function (PhadePhase) {
    PhadePhase[PhadePhase["In"] = 1] = "In";
    PhadePhase[PhadePhase["Hold"] = 2] = "Hold";
    PhadePhase[PhadePhase["Out"] = 3] = "Out";
    PhadePhase[PhadePhase["Done"] = 4] = "Done";
})(PhadePhase || (PhadePhase = {}));
