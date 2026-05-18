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
            id: "numberRoundel",
            name: "Number Roundel",
            imagePath: "./assets/decals/number-roundel.png",
            colorable: false
        }
    ],
    get(id) {
        return this.options.find(decal => decal.id === id) || this.options[0];
    }
};
