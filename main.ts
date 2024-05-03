
import { pictureBook } from "./modules/PictureBook.js";
import { soundLibrary } from "./modules/SoundLibrary.js";
import Mangerie from "./modules/Mangerie.js";

const sounds = [];

// Used in main repainter
let currentFrame: number, game: Mangerie,
    time: number = Date.now();

// Used for loading screen
let loadedImages: number = 0, loadedSounds: number = 0,
    loadingState: string = "loading", loadingComplete: boolean = false; 

window.onload = function() {
    // First load sounds
    for (let [key, sound] of soundLibrary){
        sound.object = document.createElement("audio");
        sound.object.addEventListener("loadstart", () => {
            console.log("Loaded " + sound.src + " at " + Date.now());
            loadedSounds++;

            // Then preload images from picture book
            if (loadedSounds == soundLibrary.size){
                for (let picture of pictureBook){
                    picture.img.onload = () => {
                        console.log("Loaded " + picture.src + " at " + Date.now());
                        loadedImages++;
                        if (loadedImages == pictureBook.length){
                            game = new Mangerie(pictureBook, soundLibrary);
                            loadingComplete = true;
                        }
                    }
                    picture.img.src = picture.src;
                }
            }
        });
        sound.object.setAttribute("preload", "auto");
        sound.object.setAttribute("controls", "none");
        sound.object.style.display = "none";
        sound.object.src = sound.src;
        document.body.appendChild(sound.object);
        sound.object.load();
    } 
    currentFrame = requestAnimationFrame(repainter);
}
 
const loaderContainer = document.getElementById("loader-container");
const welcomeText = document.getElementById("welcome-text");
const loaderWidget = document.getElementById("loader-widget");
const overlay = document.getElementById("overlay");
let runtime: number = 0;

// Animation durations
const welcomeFadeIn: number = 300, welcomeFadeOut: number = 1000, 
      gameStartFade: number = 1000, minLoadTime: number = 500;

function loadingScreen(timeDelta: number){
    runtime += timeDelta;
    if (loadingComplete && runtime > minLoadTime){
        loadingState = "switchingToWelcome";
        runtime = 0;
    }
}
function openWelcomeScreen(timeDelta: number){
    runtime += timeDelta;    
    if (welcomeText != null){
        if (runtime > welcomeFadeIn){
            welcomeText.style.opacity = "1";
            loadingState = "welcome";
            loaderWidget?.remove();
            welcomeText.addEventListener("click", () => {
                loadingState = "closingWelcome";
                runtime = 0;
            });
        } else {
            welcomeText.style.opacity = (runtime/welcomeFadeIn).toString();
        }
    }
}
function closeWelcomeScreen(timeDelta: number){
    runtime += timeDelta;
    if (loaderContainer != null){
        if (runtime > welcomeFadeOut){
            loaderContainer.remove();
            loadingState = "starting";
            runtime = 0;
        } else {
            loaderContainer.style.opacity = (1 - runtime/welcomeFadeOut).toString();
        }
    }
}
function startGameAnimation(timeDelta: number){
    runtime += timeDelta;
    if (overlay != null){
        if (runtime > gameStartFade + 1000){
            overlay.remove();
            loadingState = "complete";
            game.ResetKaleidoscope(0);
        } else {
            overlay.style.opacity = (1 - (runtime - 1000)/gameStartFade).toString();
        }
    }

}

// Repainter: called every frame
function repainter(): void {
    let delta: number = Date.now() - time;
    time = Date.now();

    switch (loadingState){
        case "loading":
            loadingScreen(delta);
            break;
        case "switchingToWelcome":
            openWelcomeScreen(delta);
            break;
        case "closingWelcome":
            closeWelcomeScreen(delta);
            break;
        case "starting":
            game.Repainter(delta);
            startGameAnimation(delta);
            break;
        case "complete":
            game.Repainter(delta);
            break;
    }   
    
    currentFrame = requestAnimationFrame(repainter);
}




