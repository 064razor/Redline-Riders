export const Bodywork = {
    cars: {
        maruMk5: {
            id: "maruMk5",
            displayName: "Maru MK-5",
            inspiration: "Lightweight roadster inspired by the MX-5",
            defaultPaint: "#ffffff",
            windowColor: "#111a2e",
            sprite: {
                imagePath: "./assets/cars/maru-mk5/body-white.png",
                xOffset: -12,
                yOffset: -14,
                width: 96,
                height: 75,
                rearWheel: {
                    x: 12,
                    y: 33,
                    radius: 7
                },
                frontWheel: {
                    x: 69,
                    y: 33,
                    radius: 7
                }
            },
            rims: {
                classic5: "Classic 5-Spoke",
                split6: "Split 6-Spoke",
                mesh: "Street Mesh",
                deepDish: "Deep Dish",
                star: "Star Racer"
            }
        },
        swagGG2: {
            id: "swagGG2",
            displayName: "Swag GG 2",
            inspiration: "Lightweight 70s-style hot hatch",
            defaultPaint: "#ffffff",
            windowColor: "#111a2e",
            sprite: {
                imagePath: "./assets/cars/swag-gg-2/body-white.png",
                xOffset: -10,
                yOffset: -10,
                width: 104,
                height: 50,
                rearWheel: {
                    x: 15,
                    y: 30,
                    radius: 3
                },
                frontWheel: {
                    x: 71,
                    y: 30,
                    radius: 3
                }
            },
            rims: {
                classic5: "Classic 5-Spoke",
                split6: "Split 6-Spoke",
                mesh: "Street Mesh",
                deepDish: "Deep Dish",
                star: "Star Racer"
            }
        },
        rouletteBlair: {
            id: "rouletteBlair",
            displayName: "Roulette Blair",
            inspiration: "Classic Bel-Air-inspired heavyweight muscle cruiser",
            defaultPaint: "#ffffff",
            windowColor: "#111a2e",
            sprite: {
                imagePath: "./assets/cars/roulette-blair/body-white.png",
                xOffset: -45,
                yOffset: -19,
                width: 115,
                height: 80,
                rearWheel: {
                    x: -15,
                    y: 32,
                    radius: 8
                },
                frontWheel: {
                    x: 47,
                    y: 32,
                    radius: 8
                }
            },
            rims: {
                classic5: "Classic 5-Spoke",
                split6: "Split 6-Spoke",
                mesh: "Street Mesh",
                deepDish: "Deep Dish",
                star: "Star Racer"
            }
        }
    }
};
