export type DecalDefinition = {
    id: string;
    name: string;
    imagePath: string;
    price?: number;
    colorable: boolean;
    defaultColor?: string;
};

export const Decals = {
    decalPrice: 90,

    options: [
        {
            id: "none",
            name: "None",
            imagePath: "",
            colorable: false
        },
        {
            id: "blackSideStripe",
            name: "Side Stripe",
            imagePath: "./assets/decals/black-side-stripe.png",
            colorable: true,
            defaultColor: "#0a0a0a"
        },
        {
            id: "whiteTwinStripe",
            name: "Twin Stripe",
            imagePath: "./assets/decals/white-twin-stripe.png",
            colorable: true,
            defaultColor: "#f5f5f5"
        },
        {
            id: "redSlash",
            name: "Slash",
            imagePath: "./assets/decals/red-slash.png",
            colorable: true,
            defaultColor: "#eb2841"
        },
        {
            id: "flame",
            name: "Flame",
            imagePath: "./assets/decals/flame.png",
            colorable: true,
            defaultColor: "#ff6a22"
        },
        {
            id: "spiderweb",
            name: "Spiderweb",
            imagePath: "./assets/decals/spiderweb.png",
            colorable: true,
            defaultColor: "#f5f5f5"
        },
        {
            id: "raceFlag",
            name: "Race Flag",
            imagePath: "./assets/decals/race-flag.png",
            colorable: true,
            defaultColor: "#f5f5f5"
        },
        {
            id: "technoStripe",
            name: "Techno Stripe",
            imagePath: "./assets/decals/techno-stripe.png",
            colorable: true,
            defaultColor: "#33e6ff"
        },
        {
            id: "lightningBolt",
            name: "Lightning Bolt",
            imagePath: "./assets/decals/lightning-bolt.png",
            colorable: true,
            defaultColor: "#ffe04a"
        },
        {
            id: "speedChevrons",
            name: "Speed Chevrons",
            imagePath: "./assets/decals/speed-chevrons.png",
            colorable: true,
            defaultColor: "#f5f5f5"
        },
        {
            id: "risingSun",
            name: "Rising Sun",
            imagePath: "./assets/decals/rising-sun.png",
            colorable: true,
            defaultColor: "#ff3b35",
            price: 110
        },
        {
            id: "circuitTrace",
            name: "Circuit Trace",
            imagePath: "./assets/decals/circuit-trace.png",
            colorable: true,
            defaultColor: "#47f7d4"
        },
        {
            id: "starTrail",
            name: "Star Trail",
            imagePath: "./assets/decals/star-trail.png",
            colorable: true,
            defaultColor: "#f5f5f5",
            price: 110
        },
        {
            id: "checkerStripe",
            name: "Checker Stripe",
            imagePath: "./assets/decals/checker-stripe.png",
            colorable: true,
            defaultColor: "#f5f5f5"
        },
        {
            id: "driftScratch",
            name: "Drift Scratch",
            imagePath: "./assets/decals/drift-scratch.png",
            colorable: true,
            defaultColor: "#ff4a4a"
        },
        {
            id: "numberRoundel",
            name: "Number Roundel",
            imagePath: "./assets/decals/number-roundel.png",
            colorable: false
        }
    ] as DecalDefinition[],

    get(id: string) {
        return this.options.find(decal => decal.id === id) || this.options[0];
    }
};
