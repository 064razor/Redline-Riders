import { getDisplacementTorqueCurve } from "./power.js";

function calculateTopSpeed(
    maxRPM: number,
    topGearRatio: number,
    finalDrive: number
) {
    return Math.floor(
        maxRPM / (topGearRatio * finalDrive * 330) * 20
    );
}

function calculateGearMaxSpeeds(
    maxRPM: number,
    gearRatios: number[],
    finalDrive: number
) {
    return gearRatios.map((ratio) =>
        Math.floor(maxRPM / (ratio * finalDrive * 330)) * 20
    );
}


export const GRIP_RATING_SCALE = 120;

export function normalizeGripRating(grip: number) {
    if (!Number.isFinite(grip)) return 1;

    return grip > 10
        ? grip / GRIP_RATING_SCALE
        : grip;
}

export function migrateGripRating(car: any) {
    if (!car || !Number.isFinite(car.grip)) return;

    if (car.grip <= 10) {
        car.grip = Math.round(car.grip * GRIP_RATING_SCALE);
    }
}

export function migrateGarageGripRatings(cars: any) {
    if (!cars) return;

    for (const carId of Object.keys(cars)) {
        migrateGripRating(cars[carId]);
    }
}
export function getDefaultTorqueCurve(bodyId: string) {
    if (bodyId === "swagGG2") {
        return [
            [0.00, 0.52],
            [0.24, 0.75],
            [0.44, 0.96],
            [0.64, 1.00],
            [0.84, 0.88],
            [1.00, 0.64]
        ];
    }

    if (bodyId === "rouletteBlair") {
        return [
            [0.00, 0.62],
            [0.20, 0.88],
            [0.38, 1.00],
            [0.62, 0.98],
            [0.82, 0.82],
            [1.00, 0.58]
        ];
    }

    if (bodyId === "rouletteMontBlanc") {
        return [
            [0.00, 0.54],
            [0.22, 0.76],
            [0.42, 0.92],
            [0.66, 0.90],
            [0.86, 0.70],
            [1.00, 0.50]
        ];
    }

    if (bodyId === "hannaCivilian") {
        return [
            [0.00, 0.38],
            [0.24, 0.58],
            [0.46, 0.78],
            [0.68, 0.92],
            [0.88, 0.84],
            [1.00, 0.58]
        ];
    }

    return [
        [0.00, 0.46],
        [0.22, 0.68],
        [0.42, 0.91],
        [0.62, 1.00],
        [0.82, 0.95],
        [1.00, 0.70]
    ];
}

export function migrateGarageTorqueCurves(cars: any) {
    if (!cars) return;

    for (const carId of Object.keys(cars)) {
        const car = cars[carId];

        if (!car) continue;

        if (!Array.isArray(car.torqueCurve) || car.torqueCurve.length < 2) {
            car.torqueCurve = getDefaultTorqueCurve(car.bodyId || carId);
        }
    }
}
export function migrateGaragePowerAdderCurves(cars: any) {
    if (!cars) return;

    for (const carId of Object.keys(cars)) {
        const car = cars[carId];

        if (!car) continue;

        if (car.forcedInductionType === "displacement") {
            const baseCurve =
                car.baseTorqueCurve ||
                getDefaultTorqueCurve(car.bodyId || carId);

            car.baseTorqueCurve =
                baseCurve;

            car.torqueCurve =
                getDisplacementTorqueCurve(
                    baseCurve,
                    car.displacementLevel || 1
                );

            car.boostPsi = 0;
            car.turboSpool = 0;
        }

        if (
            car.forcedInductionType === "turbo" ||
            car.forcedInductionType === "supercharger" ||
            !car.forcedInductionType ||
            car.forcedInductionType === "none"
        ) {
            car.baseTorqueCurve =
                car.baseTorqueCurve ||
                getDefaultTorqueCurve(car.bodyId || carId);

            if (!Number.isFinite(car.turboSpool)) {
                car.turboSpool = 0;
            }
        }
    }
}
function applyTopSpeedRebalance(
    car: any,
    oldTopSpeed: number,
    newTopSpeed: number,
    newGearMaxSpeeds: number[]
) {
    if (!car) return;

    const currentTopSpeed =
        Number.isFinite(car.topSpeed)
            ? car.topSpeed
            : oldTopSpeed;

    const upgradeDelta =
        Math.max(0, currentTopSpeed - oldTopSpeed);

    car.topSpeed =
        newTopSpeed + upgradeDelta;

    if (!Array.isArray(car.gearMaxSpeeds)) {
        car.gearMaxSpeeds = newGearMaxSpeeds;
        return;
    }

    car.gearMaxSpeeds =
        newGearMaxSpeeds.map((speed, index) => {
            const oldSpeed =
                index === newGearMaxSpeeds.length - 1
                    ? oldTopSpeed
                    : car.gearMaxSpeeds[index] || speed;

            const gearDelta =
                Math.max(0, (car.gearMaxSpeeds[index] || oldSpeed) - oldSpeed);

            return speed + gearDelta;
        });
}

export function migrateGarageBalanceDefaults(cars: any) {
    if (!cars) return;

    for (const carId of Object.keys(cars)) {
        const car = cars[carId];
        const bodyId = car?.bodyId || carId;

        if (!car || (car.balanceVersion || 0) >= 3) {
            continue;
        }

        if (bodyId === "rouletteBlair") {
            applyTopSpeedRebalance(car, 140, 150, [60, 85, 120, 150]);
        }

        if (bodyId === "rouletteMontBlanc") {
            const oldMontBlancTopSpeed =
                (car.balanceVersion || 0) >= 1
                    ? 130
                    : 140;

            applyTopSpeedRebalance(car, oldMontBlancTopSpeed, 122, [32, 52, 74, 98, 122]);

            if ((car.hp || 200) > 170 && (car.engineLevel || 0) === 0) {
                car.hp = 170;
            }

            if ((car.torque || 260) > 220 && (car.pistonLevel || 0) === 0 && (car.crankLevel || 0) === 0) {
                car.torque = 220;
            }

            if ((car.weight || 3400) < 3550 && (car.weightReductionLevel || 0) === 0) {
                car.weight = 3550;
                car.baseWeight = 3550;
            }

            if ((car.grip || 22) > 18 && (car.tireLevel || 0) === 0 && (car.suspensionLevel || 0) === 0) {
                car.grip = 18;
            }

            if ((car.shiftSpeed || 0.88) < 0.94 && (car.flywheelLevel || 0) === 0) {
                car.shiftSpeed = 0.94;
            }

            if ((car.ecuLevel || 0) === 0 && (car.topEndLevel || 0) === 0) {
                car.maxRPM = 5400;
                car.powerbandMin = 2500;
                car.powerbandMax = 4700;
            }

            car.torqueCurve = getDefaultTorqueCurve("rouletteMontBlanc");
        }

        if (bodyId === "hannaCivilian") {
            const oldHannaTopSpeed =
                (car.balanceVersion || 0) >= 1
                    ? 112
                    : 120;

            applyTopSpeedRebalance(car, oldHannaTopSpeed, 104, [31, 49, 67, 84, 96, 104]);

            if ((car.hp || 127) > 108 && (car.engineLevel || 0) === 0) {
                car.hp = 108;
            }

            if ((car.torque || 128) > 104 && (car.pistonLevel || 0) === 0 && (car.crankLevel || 0) === 0) {
                car.torque = 104;
            }

            if ((car.weight || 2480) <= 2480 && (car.weightReductionLevel || 0) === 0) {
                car.weight = 2600;
                car.baseWeight = 2600;
            }

            if ((car.grip || 114) > 102 && (car.tireLevel || 0) === 0 && (car.suspensionLevel || 0) === 0) {
                car.grip = 102;
            }

            if ((car.shiftSpeed || 0.34) < 0.4 && (car.flywheelLevel || 0) === 0) {
                car.shiftSpeed = 0.4;
            }

            if ((car.ecuLevel || 0) === 0 && (car.topEndLevel || 0) === 0) {
                car.maxRPM = 7000;
                car.powerbandMin = 4500;
                car.powerbandMax = 6600;
            }

            car.torqueCurve = getDefaultTorqueCurve("hannaCivilian");
        }

        car.balanceVersion = 3;
    }
}
export function getEngineType(bodyId: string) {
    if (bodyId === "rouletteBlair") {
        return "V8";
    }

    if (bodyId === "rouletteMontBlanc") {
        return "V6";
    }

    return "I4";
}

export function getDrivetrain(bodyId: string) {
    if (
        bodyId === "swagGG2" ||
        bodyId === "hannaCivilian"
    ) {
        return "FWD";
    }

    return "RWD";
}

export function refreshDrivetrain(car: any) {

    car.topSpeed = calculateTopSpeed(
        car.maxRPM,
        car.gearRatios[car.gearRatios.length - 1],
        car.finalDrive
    );

    car.gearMaxSpeeds = calculateGearMaxSpeeds(
        car.maxRPM,
        car.gearRatios,
        car.finalDrive
    );
}

export const Garage = {

    getStarter() {
        return this.getMaruMk5();
    },

    getMaruMk5() {
        return {
            name: "Maru MK-5",
            bodyId: "maruMk5",
            balanceVersion: 3,
            engineType: getEngineType("maruMk5"),
            drivetrain: getDrivetrain("maruMk5"),
            paintColor: "#ffffff",
            rimStyle: "classic5",
            decalId: "none",
            decalColor: "#ffffff",
			engineLevel: 0,
            tireLevel: 0,
            transmissionLevel: 0,
			exhaustLevel: 0,
            ecuLevel: 0,
            weightReductionLevel: 0,
            suspensionLevel: 0,
            flywheelLevel: 0,
			pistonLevel: 0,
			crankLevel: 0,
			intakeLevel: 0,
			topEndLevel: 0,
			bottomEndLevel: 0,
            forcedInductionType: "none",
            boostPsi: 0,
            turboSpool: 0,
            turboLevel: 0,
            superchargerLevel: 0,
            displacementLevel: 0,

            enginePrice: 1400,
            tirePrice: 230,
            transmissionPrice: 350,
			exhaustPrice: 180,
            ecuPrice: 260,
            weightReductionPrice: 320,
            suspensionPrice: 195,
            flywheelPrice: 300,
			pistonPrice: 450,
			crankPrice: 500,
			intakePrice: 300,
			topEndPrice: 650,
			bottomEndPrice: 750,
            turboPrice: 1800,
            superchargerPrice: 1700,
            displacementPrice: 1450,

            hp: 120,
			torque: 115,
            weight: 2400,
			baseWeight: 2400,
            grip: 120,
			launchGrip: 4.5,

            spd: 0,
            pos: 0,
            rpm: 1000,
            gear: 1,

            maxRPM: 7000,
            powerbandMin: 4500,
            powerbandMax: 6500,
            torqueCurve: [
                [0.00, 0.46],
                [0.22, 0.68],
                [0.42, 0.91],
                [0.62, 1.00],
                [0.82, 0.95],
                [1.00, 0.70]
            ],

            gears: 6,
topSpeed: calculateTopSpeed(
    7000,
    0.88,
    3.85
),

gearRatios: [
    2.65,
    1.50,
    0.95,
    0.62,
    0.44,
    0.41
],

gearMaxSpeeds: calculateGearMaxSpeeds(
    7000,
    [
        3.25,
        2.10,
        1.55,
        1.22,
        1.00,
        0.78
    ],
    3.85
),

finalDrive: 3.85,
			shiftSpeed: 0.3,
            shiftTimer: 0,
            shiftRPMDrop: false,

            needleColor: "#ff3333",
            hubColor: "#ff3333",
            tachTextColor: "#ffffff",

            wheelspin: false
        };
    },

    getSwagGG2() {
        return {
            name: "Swag GG 2",
            bodyId: "swagGG2",
            balanceVersion: 3,
            engineType: getEngineType("swagGG2"),
            drivetrain: getDrivetrain("swagGG2"),
            paintColor: "#ffffff",
            rimStyle: "classic5",
            decalId: "none",
            decalColor: "#ffffff",
			
			engineLevel: 0,
            tireLevel: 0,
            transmissionLevel: 0,
			exhaustLevel: 0,
            ecuLevel: 0,
            weightReductionLevel: 0,
            suspensionLevel: 0,
            flywheelLevel: 0,
			pistonLevel: 0,
			crankLevel: 0,
			intakeLevel: 0,
			topEndLevel: 0,
			bottomEndLevel: 0,
            forcedInductionType: "none",
            boostPsi: 0,
            turboSpool: 0,
            turboLevel: 0,
            superchargerLevel: 0,
            displacementLevel: 0,

            tirePrice: 195,
            transmissionPrice: 600,
			enginePrice: 1400,
			exhaustPrice: 130,
            ecuPrice: 275,
            weightReductionPrice: 300,
            suspensionPrice: 150,
            flywheelPrice: 340,
			pistonPrice: 450,
			crankPrice: 500,
			intakePrice: 300,
			topEndPrice: 650,
			bottomEndPrice: 750,
            turboPrice: 1800,
            superchargerPrice: 1700,
            displacementPrice: 1450,

            hp: 110,
			torque: 105,
            weight: 2050,
			baseWeight: 2050,
            grip: 98,
			launchGrip: 4.5,

            spd: 0,
            pos: 0,
            rpm: 1000,
            gear: 1,

            maxRPM: 6100,
            powerbandMin: 3600,
            powerbandMax: 5800,
            torqueCurve: [
                [0.00, 0.52],
                [0.24, 0.75],
                [0.44, 0.96],
                [0.64, 1.00],
                [0.84, 0.88],
                [1.00, 0.64]
            ],

            gears: 5,
			
			topSpeed: calculateTopSpeed(
               6100,
               0.80,
               3.57
            ),
			
            gearRatios: [3.15, 1.64, 0.99, 0.67, 0.53],
            
			gearMaxSpeeds: calculateGearMaxSpeeds(
                6100,
                [3.45, 1.94, 1.29, 0.97, 0.80],
                3.57
            ),
			
            finalDrive: 2.57,
            shiftSpeed: 0.42,
            shiftTimer: 0,
            shiftRPMDrop: false,

            needleColor: "#ff3333",
            hubColor: "#ff3333",
            tachTextColor: "#ffffff",

            wheelspin: false
        };
    },
	getRouletteBlair() {
		
    return {
        name: "Roulette Blair",
        bodyId: "rouletteBlair",
        balanceVersion: 3,
        engineType: getEngineType("rouletteBlair"),
        drivetrain: getDrivetrain("rouletteBlair"),
        paintColor: "#ffffff",
        rimStyle: "classic5",
            decalId: "none",
            decalColor: "#ffffff",
		
		engineLevel: 0,
        tireLevel: 0,
        transmissionLevel: 0,
		exhaustLevel: 0,
        ecuLevel: 0,
        weightReductionLevel: 0,
        suspensionLevel: 0,
        flywheelLevel: 0,
        pistonLevel: 0,
        crankLevel: 0,
        intakeLevel: 0,
        topEndLevel: 0,
        bottomEndLevel: 0,
        forcedInductionType: "none",
        boostPsi: 0,
        turboSpool: 0,
        turboLevel: 0,
        superchargerLevel: 0,
        displacementLevel: 0,

        enginePrice: 1575,
        tirePrice: 700,
        transmissionPrice: 350,
		exhaustPrice: 180,
        ecuPrice: 360,
        weightReductionPrice: 520,
        suspensionPrice: 250,
        flywheelPrice: 300,
		pistonPrice: 450,
		crankPrice: 500,
		intakePrice: 300,
		topEndPrice: 650,
		bottomEndPrice: 750,
            turboPrice: 1800,
            superchargerPrice: 1700,
            displacementPrice: 1450,

        hp: 265,
		torque: 320,
        weight: 4131,
		baseWeight: 4131,
        grip: 19,
		launchGrip: 2.0,

        spd: 0,
        pos: 0,
        rpm: 1000,
        gear: 1,

        maxRPM: 5400,

        powerbandMin: 2200,
        powerbandMax: 4700,
        torqueCurve: [
            [0.00, 0.62],
            [0.20, 0.88],
            [0.38, 1.00],
            [0.62, 0.98],
            [0.82, 0.82],
            [1.00, 0.58]
        ],

        gears: 4,

        topSpeed: 150,

        gearRatios: [
            2.20,
            1.52,
            1.18,
            1.05
        ],

        gearMaxSpeeds: [60, 85, 120, 150],

        finalDrive: 1.57,
        shiftSpeed: 0.66,
        shiftTimer: 0,
        shiftRPMDrop: false,

        needleColor: "#ff3333",
        hubColor: "#ff3333",
        tachTextColor: "#ffffff",

        wheelspin: false
    };
},

    getRouletteMontBlanc() {

    const car = {

        id: "rouletteMontBlanc",
		bodyId: "rouletteMontBlanc",
        balanceVersion: 3,
        engineType: getEngineType("rouletteMontBlanc"),
        drivetrain: getDrivetrain("rouletteMontBlanc"),
		paintColor: "#ffffff",
		rimStyle: "deepDish",
            decalId: "none",
            decalColor: "#ffffff",

        name: "Roulette Mont Blanc",

        hp: 170,
        torque: 220,

        weight: 3550,
        baseWeight: 3550,
        grip: 18,
        launchGrip: 1.2,
        maxRPM: 5400,
        powerbandMin: 2500,
        powerbandMax: 4700,
        torqueCurve: [
            [0.00, 0.54],
            [0.22, 0.76],
            [0.42, 0.92],
            [0.66, 0.90],
            [0.86, 0.70],
            [1.00, 0.50]
        ],
		
		gears: 5,

        topSpeed: 122,

		gearRatios: [
			2.52,
			1.68,
			1.29,
			1.00,
			0.88
		],

        finalDrive: 2.73,
        rpmFinalDrive: 3.15,

        gear: 1,
        rpm: 1000,
        spd: 0,
        pos: 0,

        shiftSpeed: 0.94,
        shiftTimer: 0,
        shiftRPMDrop: false,
        wheelspin: false,

        price: 2500,

        engineLevel: 0,
        tireLevel: 0,
        transmissionLevel: 0,
        exhaustLevel: 0,
        ecuLevel: 0,
        weightReductionLevel: 0,
        suspensionLevel: 0,
        flywheelLevel: 0,

        pistonLevel: 0,
        crankLevel: 0,
        intakeLevel: 0,
        topEndLevel: 0,
        bottomEndLevel: 0,
            forcedInductionType: "none",
            boostPsi: 0,
            turboSpool: 0,
            turboLevel: 0,
            superchargerLevel: 0,
            displacementLevel: 0,

        enginePrice: 400,
        tirePrice: 330,
        transmissionPrice: 350,
        exhaustPrice: 180,
        ecuPrice: 260,
        weightReductionPrice: 320,
        suspensionPrice: 195,
        flywheelPrice: 300,

        pistonPrice: 450,
        crankPrice: 500,
        intakePrice: 300,
        topEndPrice: 650,
        bottomEndPrice: 750,
            turboPrice: 1800,
            superchargerPrice: 1700,
            displacementPrice: 1450,

        needleColor: "#ff3333",
        hubColor: "#ff3333",
        textColor: "#ffffff"
    };

    (car as any).gearMaxSpeeds = [32, 52, 74, 98, 122];

    return car;
},
	getHannaCivilian() {

    return {
        name: "Hanna Civilian",
        bodyId: "hannaCivilian",
        balanceVersion: 3,
        engineType: getEngineType("hannaCivilian"),
        drivetrain: getDrivetrain("hannaCivilian"),

        paintColor: "#ffffff",
        rimStyle: "hyper5",
            decalId: "none",
            decalColor: "#ffffff",

        engineLevel: 0,
        tireLevel: 0,
        transmissionLevel: 0,
        exhaustLevel: 0,
        ecuLevel: 0,
        weightReductionLevel: 0,
        suspensionLevel: 0,
        flywheelLevel: 0,

        pistonLevel: 0,
        crankLevel: 0,
        intakeLevel: 0,
        topEndLevel: 0,
        bottomEndLevel: 0,
            forcedInductionType: "none",
            boostPsi: 0,
            turboSpool: 0,
            turboLevel: 0,
            superchargerLevel: 0,
            displacementLevel: 0,

        enginePrice: 1400,
        tirePrice: 250,
        transmissionPrice: 500,
        exhaustPrice: 160,
        ecuPrice: 310,
        weightReductionPrice: 280,
        suspensionPrice: 180,
        flywheelPrice: 360,

        pistonPrice: 450,
        crankPrice: 500,
        intakePrice: 300,
        topEndPrice: 650,
        bottomEndPrice: 750,
            turboPrice: 1800,
            superchargerPrice: 1700,
            displacementPrice: 1450,

        hp: 108,
        torque: 104,
        weight: 2600,
        baseWeight: 2600,

        grip: 102,
        launchGrip: 3.8,

        spd: 0,
        pos: 0,
        rpm: 1000,
        gear: 1,

        maxRPM: 7000,
        powerbandMin: 4500,
        powerbandMax: 6600,
        torqueCurve: [
            [0.00, 0.38],
            [0.24, 0.58],
            [0.46, 0.78],
            [0.68, 0.92],
            [0.88, 0.84],
            [1.00, 0.58]
        ],

        gears: 6,

        topSpeed: 104,

        gearRatios: [
            3.20,
            2.05,
            1.52,
            1.18,
            1.00,
            0.92
        ],

        gearMaxSpeeds: [31, 49, 67, 84, 96, 104],

        finalDrive: 4.10,
        shiftSpeed: 0.4,
        shiftTimer: 0,
        shiftRPMDrop: false,

        needleColor: "#ff3333",
        hubColor: "#ff3333",
        tachTextColor: "#ffffff",

        wheelspin: false
    };
},
};
