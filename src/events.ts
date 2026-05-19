export type EventDifficulty =
    "Beginner" |
    "Normal" |
    "Hard" |
    "Expert";

export type RaceEvent = {
    id: string;
    name: string;
    difficulty: EventDifficulty;
    tag: string;
    summary: string;
    payout: number;
    replayPayout: number;
    trackLength?: number;
    rounds: EventRound[];
};

export type EventRound = {
    opponentBodyId: string;
    aiDifficulty: "veryEasy" | "easy" | "normal" | "hard" | "veryHard";
    racerName?: string;
    fixedRival?: boolean;
    carSetup?: {
        paintColor?: string;
        rimStyle?: string;
        decalId?: string;
        decalColor?: string;
        underglowColor?: string;
        needleColor?: string;
        hubColor?: string;
        tachTextColor?: string;
        randomFullCustomization?: boolean;
        exhaustLevel?: number;
        ecuLevel?: number;
        crankLevel?: number;
        turboLevel?: number;
        superchargerLevel?: number;
        displacementLevel?: number;
        tireLevel?: number;
        suspensionLevel?: number;
        weightReductionLevel?: number;
        aeroLevel?: number;
        intakeLevel?: number;
        topEndLevel?: number;
        bottomEndLevel?: number;
        transmissionLevel?: number;
        flywheelLevel?: number;
    };
};

export const Events = {
    list: [
        {
            id: "sunday-driver",
            name: "Sunday Driver",
            difficulty: "Beginner",
            tag: "3 Races",
            summary: "A beginner event built around easy street matchups and one named rival.",
            payout: 300,
            replayPayout: 150,
            rounds: [
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "veryEasy"
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "veryEasy"
                },
                {
                    opponentBodyId: "maruMk5",
                    aiDifficulty: "easy",
                    racerName: "Cruz",
                    fixedRival: true,
                    carSetup: {
                        paintColor: "#071a4a",
                        rimStyle: "hyper5",
                        decalId: "redSlash",
                        decalColor: "#000000",
                        flywheelLevel: 2
                    }
                }
            ]
        },
        {
            id: "ricer-rama",
            name: "Ricer-rama",
            difficulty: "Beginner",
            tag: "3 Races",
            summary: "A bright beginner event packed with easy Maru MK-5 racers and noisy bolt-ons.",
            payout: 300,
            replayPayout: 150,
            rounds: [
                {
                    opponentBodyId: "maruMk5",
                    aiDifficulty: "easy",
                    carSetup: {
                        exhaustLevel: 2,
                        ecuLevel: 1,
                        randomFullCustomization: true
                    }
                },
                {
                    opponentBodyId: "maruMk5",
                    aiDifficulty: "easy",
                    carSetup: {
                        exhaustLevel: 2,
                        ecuLevel: 1,
                        randomFullCustomization: true
                    }
                },
                {
                    opponentBodyId: "maruMk5",
                    aiDifficulty: "easy",
                    carSetup: {
                        exhaustLevel: 2,
                        ecuLevel: 1,
                        randomFullCustomization: true
                    }
                }
            ]
        },
        {
            id: "monday-driver",
            name: "Monday Driver",
            difficulty: "Beginner",
            tag: "5 Races",
            summary: "An easy follow-up event where Cruz returns with a sharper turbo build.",
            payout: 350,
            replayPayout: 175,
            rounds: [
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "easy",
                    carSetup: {
                        crankLevel: 2,
                        intakeLevel: 2,
                        suspensionLevel: 2,
                        flywheelLevel: 2
                    }
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "easy",
                    carSetup: {
                        crankLevel: 2,
                        intakeLevel: 2,
                        suspensionLevel: 2,
                        flywheelLevel: 2
                    }
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "easy",
                    carSetup: {
                        crankLevel: 2,
                        intakeLevel: 2,
                        suspensionLevel: 2,
                        flywheelLevel: 2
                    }
                },
                {
                    opponentBodyId: "rouletteMontBlanc",
                    aiDifficulty: "easy",
                    carSetup: {
                        ecuLevel: 2,
                        suspensionLevel: 1
                    }
                },
                {
                    opponentBodyId: "maruMk5",
                    aiDifficulty: "easy",
                    racerName: "Cruz",
                    fixedRival: true,
                    carSetup: {
                        paintColor: "#071a4a",
                        rimStyle: "hyper5",
                        decalId: "redSlash",
                        decalColor: "#000000",
                        turboLevel: 1,
                        tireLevel: 1,
                        flywheelLevel: 5
                    }
                }
            ]
        },
        {
            id: "gg-ez",
            name: "GG EZ",
            difficulty: "Beginner",
            tag: "3 Races",
            summary: "A trio of easy Swag GG racers with just enough turbo to get brave.",
            payout: 300,
            replayPayout: 150,
            rounds: [
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "easy",
                    carSetup: {
                        turboLevel: 1
                    }
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "easy",
                    carSetup: {
                        turboLevel: 1
                    }
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "easy",
                    carSetup: {
                        turboLevel: 1
                    }
                }
            ]
        },
        {
            id: "au-naturalle",
            name: "Au Naturalle",
            difficulty: "Hard",
            tag: "4 Races",
            summary: "An NA-only challenge where momentum, weight, and clean power decide the race.",
            payout: 400,
            replayPayout: 200,
            rounds: [
                {
                    opponentBodyId: "hannaCivilian",
                    aiDifficulty: "normal",
                    carSetup: {
                        exhaustLevel: 2,
                        aeroLevel: 2,
                        transmissionLevel: 1,
                        flywheelLevel: 1,
                        randomFullCustomization: true
                    }
                },
                {
                    opponentBodyId: "rouletteBlair",
                    aiDifficulty: "normal",
                    carSetup: {
                        tireLevel: 3,
                        weightReductionLevel: 2
                    }
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "normal",
                    carSetup: {
                        tireLevel: 1,
                        topEndLevel: 2,
                        intakeLevel: 3,
                        bottomEndLevel: 1,
                        weightReductionLevel: 1
                    }
                },
                {
                    opponentBodyId: "maruMk5",
                    aiDifficulty: "normal",
                    racerName: "Pinky",
                    fixedRival: true,
                    carSetup: {
                        weightReductionLevel: 2,
                        suspensionLevel: 2,
                        aeroLevel: 3,
                        displacementLevel: 3,
                        flywheelLevel: 2,
                        paintColor: "#2c2c32",
                        rimStyle: "dragDish",
                        decalId: "redSlash",
                        decalColor: "#ff4fb8",
                        underglowColor: "#ff2fb1"
                    }
                }
            ]
        },
        {
            id: "super-swag",
            name: "Super Swag",
            difficulty: "Hard",
            tag: "4 Races",
            summary: "A supercharged Swag GG event where grip and quick boost matter fast.",
            payout: 400,
            replayPayout: 200,
            rounds: [
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "normal",
                    carSetup: {
                        bottomEndLevel: 1,
                        topEndLevel: 3,
                        tireLevel: 1,
                        superchargerLevel: 1,
                        ecuLevel: 5,
                        randomFullCustomization: true
                    }
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "normal",
                    carSetup: {
                        bottomEndLevel: 1,
                        topEndLevel: 3,
                        tireLevel: 1,
                        superchargerLevel: 1,
                        ecuLevel: 5,
                        randomFullCustomization: true
                    }
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "normal",
                    carSetup: {
                        bottomEndLevel: 1,
                        topEndLevel: 3,
                        tireLevel: 1,
                        superchargerLevel: 1,
                        ecuLevel: 5,
                        randomFullCustomization: true
                    }
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "normal",
                    racerName: "Little Kaizer",
                    fixedRival: true,
                    carSetup: {
                        weightReductionLevel: 3,
                        tireLevel: 2,
                        superchargerLevel: 2,
                        transmissionLevel: 2,
                        flywheelLevel: 2,
                        paintColor: "#f4df8b",
                        rimStyle: "mesh",
                        decalId: "risingSun",
                        decalColor: "#6f0f16",
                        underglowColor: ""
                    }
                }
            ]
        },
        {
            id: "cyber-riders",
            name: "Cyber Riders",
            difficulty: "Hard",
            tag: "3 Races",
            summary: "A neon-white rival crew running sharp electronics, bright decals, and focused builds.",
            payout: 450,
            replayPayout: 225,
            rounds: [
                {
                    opponentBodyId: "hannaCivilian",
                    aiDifficulty: "normal",
                    racerName: "Codex",
                    fixedRival: true,
                    carSetup: {
                        ecuLevel: 5,
                        transmissionLevel: 2,
                        crankLevel: 3,
                        turboLevel: 1,
                        paintColor: "#ffffff",
                        rimStyle: "star",
                        decalId: "technoStripe",
                        decalColor: "#7cff00",
                        underglowColor: "#7cff00"
                    }
                },
                {
                    opponentBodyId: "maruMk5",
                    aiDifficulty: "normal",
                    racerName: "Archive",
                    fixedRival: true,
                    carSetup: {
                        ecuLevel: 5,
                        topEndLevel: 2,
                        bottomEndLevel: 2,
                        displacementLevel: 1,
                        paintColor: "#ffffff",
                        rimStyle: "star",
                        decalId: "technoStripe",
                        decalColor: "#7cff00",
                        underglowColor: "#7cff00"
                    }
                },
                {
                    opponentBodyId: "rouletteMontBlanc",
                    aiDifficulty: "normal",
                    racerName: "Matrix",
                    fixedRival: true,
                    carSetup: {
                        tireLevel: 1,
                        ecuLevel: 5,
                        flywheelLevel: 4,
                        superchargerLevel: 1,
                        paintColor: "#ffffff",
                        rimStyle: "star",
                        decalId: "technoStripe",
                        decalColor: "#7cff00",
                        underglowColor: "#7cff00"
                    }
                }
            ]
        },
        {
            id: "high-speed-haul",
            name: "High-speed Haul",
            difficulty: "Hard",
            tag: "1/2 Mile",
            summary: "The first half-mile event, built for cars that can keep pulling after the launch.",
            payout: 450,
            replayPayout: 225,
            trackLength: 360,
            rounds: [
                {
                    opponentBodyId: "rouletteMontBlanc",
                    aiDifficulty: "normal",
                    carSetup: {
                        tireLevel: 2,
                        bottomEndLevel: 1,
                        flywheelLevel: 4
                    }
                },
                {
                    opponentBodyId: "rouletteMontBlanc",
                    aiDifficulty: "normal",
                    carSetup: {
                        tireLevel: 2,
                        bottomEndLevel: 1,
                        flywheelLevel: 4
                    }
                },
                {
                    opponentBodyId: "rouletteBlair",
                    aiDifficulty: "normal",
                    carSetup: {
                        weightReductionLevel: 3,
                        tireLevel: 2,
                        turboLevel: 1
                    }
                },
                {
                    opponentBodyId: "maruMk5",
                    aiDifficulty: "normal",
                    racerName: "Mako",
                    fixedRival: true,
                    carSetup: {
                        paintColor: "#ff3fb8",
                        rimStyle: "splitTen",
                        decalId: "speedChevrons",
                        decalColor: "#7fffd4",
                        underglowColor: "#7fffd4",
                        aeroLevel: 5,
                        superchargerLevel: 1,
                        transmissionLevel: 3,
                        tireLevel: 1,
                        intakeLevel: 3,
                        crankLevel: 1,
                        flywheelLevel: 2
                    }
                }
            ]
        },
        {
            id: "big-block-battle",
            name: "Big Block Battle",
            difficulty: "Normal",
            tag: "1/2 Mile",
            summary: "A half-mile muscle event where lighter Blairs try to keep pulling to the line.",
            payout: 450,
            replayPayout: 225,
            trackLength: 360,
            rounds: [
                {
                    opponentBodyId: "rouletteBlair",
                    aiDifficulty: "normal",
                    carSetup: {
                        tireLevel: 2,
                        weightReductionLevel: 2
                    }
                },
                {
                    opponentBodyId: "rouletteBlair",
                    aiDifficulty: "normal",
                    carSetup: {
                        tireLevel: 2,
                        weightReductionLevel: 2
                    }
                },
                {
                    opponentBodyId: "rouletteBlair",
                    aiDifficulty: "normal",
                    racerName: "Rocket",
                    fixedRival: true,
                    carSetup: {
                        tireLevel: 2,
                        suspensionLevel: 2,
                        ecuLevel: 4,
                        aeroLevel: 1,
                        flywheelLevel: 7,
                        transmissionLevel: 1,
                        topEndLevel: 2,
                        crankLevel: 3,
                        paintColor: "#ffffff",
                        rimStyle: "muscleChrome",
                        decalId: "starTrail",
                        decalColor: "#071a4a",
                        underglowColor: "#ff2222"
                    }
                }
            ]
        },
        {
            id: "savants-of-slow",
            name: "Savants of Slow",
            difficulty: "Normal",
            tag: "4 Races",
            summary: "A longer event for underestimated cars, mixed easy racers, and one stubborn rival.",
            payout: 335,
            replayPayout: 150,
            rounds: [
                {
                    opponentBodyId: "maruMk5",
                    aiDifficulty: "easy",
                    carSetup: {
                        randomFullCustomization: true
                    }
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "normal",
                    carSetup: {
                        suspensionLevel: 1,
                        randomFullCustomization: true
                    }
                },
                {
                    opponentBodyId: "swagGG2",
                    aiDifficulty: "normal",
                    carSetup: {
                        suspensionLevel: 1,
                        randomFullCustomization: true
                    }
                },
                {
                    opponentBodyId: "rouletteBlair",
                    aiDifficulty: "normal",
                    racerName: "Rocket",
                    fixedRival: true,
                    carSetup: {
                        tireLevel: 1,
                        suspensionLevel: 2,
                        ecuLevel: 4,
                        flywheelLevel: 5,
                        paintColor: "#ffffff",
                        rimStyle: "muscleChrome",
                        decalId: "starTrail",
                        decalColor: "#071a4a",
                        underglowColor: "#ff2222"
                    }
                }
            ]
        }
    ] as RaceEvent[],

    getById(id: string) {
        return this.list.find(event => event.id === id) || null;
    }
};
