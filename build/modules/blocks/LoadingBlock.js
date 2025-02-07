import PhadeBlock from "./PhadeBlock.js";
import { PhadePhase } from "../Enums.js";
import { getJSON } from "../Helpers.js";
import PhotoAlbum from "./album/PhotoAlbum.js";
// LOADING WIDGET: ROTATES UNTIL GAME SIGNALS THAT LOADING IS COMPLETE
export default class LoadingBlock extends PhadeBlock {
    // CONSTRUCTOR
    constructor(mangerie) {
        const widget = document.getElementById("loader-widget");
        super(mangerie, widget, widget);
        // ANIMATION PROPERTIES
        this.minimumLoadTime = 750;
        this.rotationFactor = 0.4;
        this.loadtime = 0;
        // LOADING PROPS
        this.albumPaths = ["assets/albums/bodybuilders/album.json", "assets/albums/art/album.json"];
        this.loadingInProgress = true;
        this.firstTimeLoading = true;
        this.rawAlbums = [];
        this.loadedAlbums = 0;
        this.durationIn = 100;
        this.durationOut = 200;
    }
    // OVERRIDE ENABLE METHOD
    Enable(full = false) {
        super.Enable(full);
        this.loadingInProgress = true;
        this.LoadAssets();
    }
    // LOADING LOGIC: STARTED EVERY TIME COMPONENT IS ENABLED
    // Fork: either load everything (when starting game) or only load albums (when updating albums)
    LoadAssets() {
        const loader = this.firstTimeLoading ? this.LoadMainAssets.bind(this) : this.LoadAlbums.bind(this);
        loader();
    }
    // Left fork: load sounds and main assets before loading albums
    LoadMainAssets() {
        // Start with sounds sounds
        const utilityContainer = document.getElementById("utility-box");
        console.log("Loading sound effects. Credits:");
        for (let [key, sound] of this.mangerie.sounds.content) {
            sound.object.addEventListener("loadstart", () => {
                console.log(`-${key}: ${sound.desc}`);
                // Then load base images
                if (this.mangerie.sounds.Loaded()) {
                    console.log("Loaded all sounds: starting on main images");
                    for (let asset of this.mangerie.assets.content) {
                        asset.object.onload = () => {
                            console.log("Loaded " + asset.desc);
                            if (this.mangerie.assets.Loaded()) {
                                console.log("Loaded main images: starting on photo albums");
                                // With all assets loaded, go through HTML image tags & allow them to load
                                const imgTags = Array.from(document.getElementsByTagName("img"));
                                imgTags.forEach((img) => {
                                    if (img.dataset.src != undefined)
                                        img.src = img.dataset.src;
                                });
                                // Disable first time loading to avoid reloading main assets
                                this.firstTimeLoading = false;
                                // Load photo albums
                                this.LoadAlbums();
                            }
                        };
                        asset.object.src = asset.src;
                    }
                }
            });
            sound.object.setAttribute("preload", "auto");
            sound.object.setAttribute("controls", "none");
            sound.object.src = sound.src;
            utilityContainer.appendChild(sound.object);
            sound.object.load();
        }
    }
    // Right fork: only load albums  
    async LoadAlbums() {
        this.loadedAlbums = 0;
        // First get default albums from JSON files
        this.rawAlbums = [];
        for (let path of this.albumPaths) {
            const rawAlbum = await getJSON(path);
            if (rawAlbum !== null)
                this.rawAlbums.push(rawAlbum);
        }
        // Next get custom albums from local storage  
        // Normalize albums: add logic to signal load progress 
        const albums = [];
        this.rawAlbums.forEach((rawAlbum) => {
            albums.push(new PhotoAlbum(rawAlbum, albums.length));
        });
        // Start loading albums
        albums.forEach((album) => {
            for (let photo of album.content) {
                photo.object.onload = () => {
                    if (album.Loaded()) {
                        this.loadedAlbums++;
                        console.log("Completely loaded '" + album.title + "' photo album");
                        if (this.loadedAlbums >= albums.length) {
                            console.log("Everything was loaded");
                            this.loadingInProgress = false;
                        }
                    }
                };
                photo.object.src = photo.src;
            }
        });
        // Push normaized albums to mangerie (for use in other components)
        this.mangerie.Albums = albums;
    }
    // UPDATE FUNCTION: CHANGE STATE WHEN GAME HAS FINISHED LOADING
    Update(delta) {
        this.loadtime += delta;
        const fader = this.Fade.bind(this);
        const state = fader(delta);
        if (!this.loadingInProgress && (this.loadtime >= this.minimumLoadTime) && state === PhadePhase.Hold) {
            this.Disable();
            this.mangerie.SetState(this.mangerie.former);
        }
        this.mainElement.style.transform = "rotate(" + this.loadtime * this.rotationFactor + "deg)";
        return state;
    }
}
