import { AssetObject } from "./Interfaces.js";

// AssetBox is the basic container for all assets
// makes the loading counter an internal matter
// ... as it should be ...

export class AssetMap<x> {
    // Assign content in constructor
    public readonly content: Map<string, AssetObject<x>>;
    private size: number;
    constructor (content: Map<string, AssetObject<x>>){
        this.content = content;
        this.size = content.size;
    }

    // Loading logic: return true when all items are loaded
    private loaded: number = 0;
    public Loaded(): boolean {
        this.loaded++;
        return (this.loaded == this.size);
    }
}

// Same principle, but now to load arrays
export class AssetArray<x> {
    // Assign content in constructor
    public readonly content: AssetObject<x>[];
    private size: number;
    constructor (content: AssetObject<x>[]){
        this.content = content;
        this.size = content.length;
    }

    // Loading logic: return true when all items are loaded
    private loaded: number = 0;
    public Loaded(): boolean {
        this.loaded++;
        return (this.loaded == this.size);
    }
}

// Main assets: menu and interface images
export const imageLibrary: AssetObject<HTMLImageElement>[] = [
    {
        desc: "animated webp showing how to increase facets", 
        src: "assets/tutorial/angler_tutorial.webp", object: new Image()
    }
    ,
    {
        desc: "animated webp showing how to change base image", 
        src: "assets/tutorial/image_tutorial.webp", object: new Image()
    }
    ,
    {
        desc: "animated webp showing how to rotate base image", 
        src: "assets/tutorial/rotator_tutorial.webp", object: new Image()
    }
    ,
    {
        desc: "logo for menu", 
        src: "assets/mangerie.webp", object: new Image()
    }
    ,
    {
        desc: "logo overlay for menu", 
        src: "assets/mangerie-online.webp", object: new Image()
    }
];

// Sound effects library
export const soundLibrary: Map<string, AssetObject<HTMLAudioElement>> = new Map([
    ["click",
        {
            src: "assets/sounds/click.mp3", 
            desc: "creative commons @ https://freesound.org/people/kwahmah_02/sounds/256116/",
            object: new Audio()
        }
    ],
    ["harps",
        {
            src: "assets/sounds/harps.mp3", 
            desc: "creative commons @ https://freesound.org/people/SoundMaker25/sounds/534959/",
            object: new Audio()
        }
    ],
    ["switch",
        {
            src: "assets/sounds/chain.mp3",
            desc: "creative commons @ https://freesound.org/people/cbakos/sounds/50641/",
            object: new Audio()
        }
    ],
    ["tick_1",
        {
            src: "assets/sounds/tick1.mp3",
            desc: "creative commons @ https://freesound.org/people/unfa/sounds/156667/",
            object: new Audio()
        }
    ],
    ["tick_2",
        {
            src: "assets/sounds/tick2.mp3",
            desc: "creative commons @ https://freesound.org/people/day-garwood/sounds/612750/",
            object: new Audio()
        }
    ],
    ["tick_3",
        {
            src: "assets/sounds/tick3.mp3",
            desc: "creative commons @ https://freesound.org/people/fellur/sounds/429721/",
            object: new Audio()
        }
    ]
]);