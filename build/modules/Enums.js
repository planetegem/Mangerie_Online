export var GameState;
(function (GameState) {
    GameState[GameState["Loading"] = 0] = "Loading";
    GameState[GameState["Welcome"] = 1] = "Welcome";
    GameState[GameState["Menu"] = 2] = "Menu";
    GameState[GameState["Starting"] = 3] = "Starting";
    GameState[GameState["Complete"] = 4] = "Complete";
    GameState[GameState["Tutorial"] = 5] = "Tutorial";
    GameState[GameState["Playing"] = 6] = "Playing";
})(GameState || (GameState = {}));
export var PhadePhase;
(function (PhadePhase) {
    PhadePhase[PhadePhase["In"] = 1] = "In";
    PhadePhase[PhadePhase["Hold"] = 2] = "Hold";
    PhadePhase[PhadePhase["Out"] = 3] = "Out";
    PhadePhase[PhadePhase["Done"] = 4] = "Done";
})(PhadePhase || (PhadePhase = {}));
