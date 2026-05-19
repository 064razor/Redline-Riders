import { getDisplacementTorqueCurve } from "./power.js";
function calculateTopSpeed(maxRPM, topGearRatio, finalDrive) {
    return Math.floor(maxRPM / (topGearRatio * finalDrive * 330) * 20);
}
function calculateGearMaxSpeeds(maxRPM, gearRatios, finalDrive) {
    return gearRatios.map((ratio) => Math.floor(maxRPM / (ratio * finalDrive * 330)) * 20);
}
export const GRIP_RATING_SCALE = 120;
export function normalizeGripRating(grip) {
    if (!Number.isFinite(grip))
        return 1;
    return grip > 10
        ? grip / GRIP_RATING_SCALE
        : grip;
}
export function migrateGripRating(car) {
    if (!car || !Number.isFinite(car.grip))
        return;
    if (car.grip <= 10) {
        car.grip = Math.round(car.grip * GRIP_RATING_SCALE);
    }
}
export function migrateGarageGripRatings(cars) {
    if (!cars)
        return;
    for (const carId of Object.keys(cars)) {
        migrateGripRating(cars[carId]);
    }
}
export function getDefaultTorqueCurve(bodyId) {
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
            [0.00, 0.34],
            [0.24, 0.50],
            [0.46, 0.70],
            [0.68, 0.84],
            [0.88, 0.78],
            [1.00, 0.54]
        ];
    }
    if (bodyId === "swagLadybug2024") {
        return [
            [0.00, 0.44],
            [0.22, 0.64],
            [0.44, 0.86],
            [0.66, 1.00],
            [0.84, 0.88],
            [1.00, 0.58]
        ];
    }
    if (bodyId === "scholarVibratio") {
        return [
            [0.00, 0.56],
            [0.22, 0.82],
            [0.42, 1.00],
            [0.64, 0.94],
            [0.84, 0.78],
            [1.00, 0.55]
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
export function migrateGarageTorqueCurves(cars) {
    if (!cars)
        return;
    for (const carId of Object.keys(cars)) {
        const car = cars[carId];
        if (!car)
            continue;
        if (!Array.isArray(car.torqueCurve) || car.torqueCurve.length < 2) {
            car.torqueCurve = getDefaultTorqueCurve(car.bodyId || carId);
        }
    }
}
export function migrateGaragePowerAdderCurves(cars) {
    if (!cars)
        return;
    for (const carId of Object.keys(cars)) {
        const car = cars[carId];
        if (!car)
            continue;
        if (car.forcedInductionType === "displacement") {
            const baseCurve = car.baseTorqueCurve ||
                getDefaultTorqueCurve(car.bodyId || carId);
            car.baseTorqueCurve =
                baseCurve;
            car.torqueCurve =
                getDisplacementTorqueCurve(baseCurve, car.displacementLevel || 1);
            car.boostPsi = 0;
            car.turboSpool = 0;
        }
        if (car.forcedInductionType === "turbo" ||
            car.forcedInductionType === "supercharger" ||
            !car.forcedInductionType ||
            car.forcedInductionType === "none") {
            car.baseTorqueCurve =
                car.baseTorqueCurve ||
                    getDefaultTorqueCurve(car.bodyId || carId);
            if (!Number.isFinite(car.turboSpool)) {
                car.turboSpool = 0;
            }
        }
    }
}
export function getDefaultDragCoefficient(bodyId) {
    if (bodyId === "maruMk5")
        return 0.31;
    if (bodyId === "hannaCivilian")
        return 0.34;
    if (bodyId === "swagLadybug2024")
        return 0.36;
    if (bodyId === "scholarVibratio")
        return 0.36;
    if (bodyId === "rouletteBlair")
        return 0.39;
    if (bodyId === "swagGG2")
        return 0.42;
    if (bodyId === "rouletteMontBlanc")
        return 0.46;
    return 0.34;
}
export function getCarArchetype(bodyId) {
    if (bodyId === "maruMk5") {
        return {
            id: "balancedRoadster",
            name: "Balanced Roadster",
            focus: "Lightweight all-rounder with friendly handling and efficient aero.",
            strengths: ["Balanced upgrades", "Clean shifting", "Short-to-medium tracks"],
            cautions: ["Needs power to dominate longer races"]
        };
    }
    if (bodyId === "swagGG2") {
        return {
            id: "momentumHatch",
            name: "Momentum Hatch",
            focus: "Low-weight FWD hatch that rewards launch control and careful traction upgrades.",
            strengths: ["Light weight", "Early acceleration", "Cheap tuning"],
            cautions: ["Aero drag", "FWD wheelspin", "Needs gearing for long tracks"]
        };
    }
    if (bodyId === "rouletteBlair") {
        return {
            id: "heavyMuscleCruiser",
            name: "Heavy Muscle Cruiser",
            focus: "Big-torque heavyweight that wants grip, weight reduction, and room to pull.",
            strengths: ["Torque", "Top speed potential", "Forced induction payoff"],
            cautions: ["Weight", "Traction", "Slow shift recovery"]
        };
    }
    if (bodyId === "rouletteMontBlanc") {
        return {
            id: "budgetV6Bruiser",
            name: "Budget V6 Bruiser",
            focus: "Affordable muscle coupe with strong midrange but limited stock grip and aero.",
            strengths: ["Midrange torque", "Upgrade value", "Short-track pressure"],
            cautions: ["Grip", "Drag", "Stock top-end fade"]
        };
    }
    if (bodyId === "hannaCivilian") {
        return {
            id: "economyTuner",
            name: "Economy Tuner",
            focus: "Compact commuter base that needs deliberate upgrades before it becomes serious.",
            strengths: ["Upgrade flexibility", "Transmission gains", "Efficient coupe shape"],
            cautions: ["Weak stock acceleration", "Modest torque", "Needs balanced investment"]
        };
    }
    if (bodyId === "swagLadybug2024") {
        return {
            id: "friendlyStarter",
            name: "Friendly Starter",
            focus: "Soft compact hatch with approachable grip, modest power, and broad upgrade options.",
            strengths: ["Easy control", "Balanced stats", "Starter-friendly"],
            cautions: ["Weak stock power", "Average top speed", "Needs upgrades to specialize"]
        };
    }
    if (bodyId === "scholarVibratio") {
        return {
            id: "awdLauncher",
            name: "AWD Launcher",
            focus: "All-wheel-drive practical sedan that launches cleanly and stays composed, but carries extra weight.",
            strengths: ["Launch consistency", "Traction", "Short-to-medium tracks"],
            cautions: ["Weight", "Average top end", "Needs power to pull away"]
        };
    }
    return {
        id: "generalPurpose",
        name: "General Purpose",
        focus: "Flexible build with no specialized tuning identity yet.",
        strengths: ["Adaptable"],
        cautions: ["Undefined role"]
    };
}
export function applyCarArchetype(car) {
    if (!car)
        return;
    const archetype = getCarArchetype(car.bodyId || "");
    car.archetypeId =
        archetype.id;
    car.archetypeName =
        archetype.name;
    car.archetypeFocus =
        archetype.focus;
    car.archetypeStrengths =
        archetype.strengths;
    car.archetypeCautions =
        archetype.cautions;
}
export function migrateGarageArchetypes(cars) {
    if (!cars)
        return;
    for (const carId of Object.keys(cars)) {
        applyCarArchetype(cars[carId]);
    }
}
export function migrateGarageDragCoefficients(cars) {
    if (!cars)
        return;
    for (const carId of Object.keys(cars)) {
        const car = cars[carId];
        if (!car)
            continue;
        if (!Number.isFinite(car.dragCoefficient)) {
            car.dragCoefficient =
                getDefaultDragCoefficient(car.bodyId || carId);
        }
        if (!Number.isFinite(car.aeroLevel)) {
            car.aeroLevel = 0;
        }
        if (!Number.isFinite(car.aeroPrice)) {
            car.aeroPrice = 575;
        }
    }
}
function applyTopSpeedRebalance(car, oldTopSpeed, newTopSpeed, newGearMaxSpeeds) {
    if (!car)
        return;
    const currentTopSpeed = Number.isFinite(car.topSpeed)
        ? car.topSpeed
        : oldTopSpeed;
    const upgradeDelta = Math.max(0, currentTopSpeed - oldTopSpeed);
    car.topSpeed =
        newTopSpeed + upgradeDelta;
    if (!Array.isArray(car.gearMaxSpeeds)) {
        car.gearMaxSpeeds = newGearMaxSpeeds;
        return;
    }
    car.gearMaxSpeeds =
        newGearMaxSpeeds.map((speed, index) => {
            const oldSpeed = index === newGearMaxSpeeds.length - 1
                ? oldTopSpeed
                : car.gearMaxSpeeds[index] || speed;
            const gearDelta = Math.max(0, (car.gearMaxSpeeds[index] || oldSpeed) - oldSpeed);
            return speed + gearDelta;
        });
}
export function migrateGarageBalanceDefaults(cars) {
    if (!cars)
        return;
    for (const carId of Object.keys(cars)) {
        const car = cars[carId];
        const bodyId = (car === null || car === void 0 ? void 0 : car.bodyId) || carId;
        if (!car || (car.balanceVersion || 0) >= 5) {
            continue;
        }
        if (bodyId === "rouletteBlair") {
            applyTopSpeedRebalance(car, 140, 150, [60, 85, 120, 150]);
        }
        if (bodyId === "rouletteMontBlanc") {
            const oldMontBlancTopSpeed = (car.balanceVersion || 0) >= 1
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
            const oldHannaTopSpeed = (car.balanceVersion || 0) >= 1
                ? 112
                : 120;
            const previousTopSpeed = Number.isFinite(car.topSpeed)
                ? car.topSpeed
                : oldHannaTopSpeed;
            const topSpeedUpgradeDelta = Math.max(0, previousTopSpeed - 104);
            applyTopSpeedRebalance(car, oldHannaTopSpeed, 104, [34, 54, 73, 89, 98, 104]);
            car.topSpeed =
                104 + topSpeedUpgradeDelta;
            car.gearMaxSpeeds = [34, 54, 73, 89, 98, car.topSpeed];
            const hpUpgradeDelta = Math.max(0, (car.hp || 108) - 108);
            const torqueUpgradeDelta = Math.max(0, (car.torque || 104) - 104);
            car.hp =
                98 + hpUpgradeDelta;
            car.torque =
                94 + torqueUpgradeDelta;
            if ((car.weightReductionLevel || 0) === 0) {
                car.weight = 2700;
            }
            else {
                car.weight =
                    Math.min((car.weight || 2600) + 100, 2700);
            }
            car.baseWeight = 2700;
            if ((car.tireLevel || 0) === 0 && (car.suspensionLevel || 0) === 0) {
                car.grip = 96;
            }
            else if ((car.tireLevel || 0) > 0 || (car.suspensionLevel || 0) > 0) {
                car.grip =
                    Math.max(35, Math.round((car.grip || 102) - 6));
            }
            if ((car.shiftSpeed || 0.34) < 0.56 && (car.flywheelLevel || 0) === 0) {
                car.shiftSpeed = 0.56;
            }
            if ((car.ecuLevel || 0) === 0 && (car.topEndLevel || 0) === 0) {
                car.maxRPM = 7000;
                car.powerbandMin = 4500;
                car.powerbandMax = 6600;
            }
            car.gearRatios = [
                2.92,
                1.82,
                1.35,
                1.05,
                0.92,
                0.84
            ];
            car.finalDrive = 3.74;
            car.torqueCurve = getDefaultTorqueCurve("hannaCivilian");
        }
        car.balanceVersion = 5;
    }
}
export function getEngineType(bodyId) {
    if (bodyId === "rouletteBlair") {
        return "V8";
    }
    if (bodyId === "rouletteMontBlanc") {
        return "V6";
    }
    return "I4";
}
export function getDrivetrain(bodyId) {
    if (bodyId === "scholarVibratio") {
        return "AWD";
    }
    if (bodyId === "swagGG2" ||
        bodyId === "hannaCivilian" ||
        bodyId === "swagLadybug2024") {
        return "FWD";
    }
    return "RWD";
}
export function refreshDrivetrain(car) {
    car.topSpeed = calculateTopSpeed(car.maxRPM, car.gearRatios[car.gearRatios.length - 1], car.finalDrive);
    car.gearMaxSpeeds = calculateGearMaxSpeeds(car.maxRPM, car.gearRatios, car.finalDrive);
}
export const Garage = {
    getStarter() {
        return this.getMaruMk5();
    },
    getMaruMk5() {
        return {
            name: "Maru MK-5",
            bodyId: "maruMk5",
            archetypeId: getCarArchetype("maruMk5").id,
            archetypeName: getCarArchetype("maruMk5").name,
            archetypeFocus: getCarArchetype("maruMk5").focus,
            archetypeStrengths: getCarArchetype("maruMk5").strengths,
            archetypeCautions: getCarArchetype("maruMk5").cautions,
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
            aeroLevel: 0,
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
            aeroPrice: 575,
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
            dragCoefficient: 0.31,
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
            topSpeed: calculateTopSpeed(7000, 0.88, 3.85),
            gearRatios: [
                2.65,
                1.50,
                0.95,
                0.62,
                0.44,
                0.41
            ],
            gearMaxSpeeds: calculateGearMaxSpeeds(7000, [
                3.25,
                2.10,
                1.55,
                1.22,
                1.00,
                0.78
            ], 3.85),
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
            archetypeId: getCarArchetype("swagGG2").id,
            archetypeName: getCarArchetype("swagGG2").name,
            archetypeFocus: getCarArchetype("swagGG2").focus,
            archetypeStrengths: getCarArchetype("swagGG2").strengths,
            archetypeCautions: getCarArchetype("swagGG2").cautions,
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
            aeroLevel: 0,
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
            aeroPrice: 575,
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
            dragCoefficient: 0.42,
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
            topSpeed: calculateTopSpeed(6100, 0.80, 3.57),
            gearRatios: [3.15, 1.64, 0.99, 0.67, 0.53],
            gearMaxSpeeds: calculateGearMaxSpeeds(6100, [3.45, 1.94, 1.29, 0.97, 0.80], 3.57),
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
    getSwagLadybug2024() {
        return {
            name: "Swag Ladybug 2024",
            bodyId: "swagLadybug2024",
            archetypeId: getCarArchetype("swagLadybug2024").id,
            archetypeName: getCarArchetype("swagLadybug2024").name,
            archetypeFocus: getCarArchetype("swagLadybug2024").focus,
            archetypeStrengths: getCarArchetype("swagLadybug2024").strengths,
            archetypeCautions: getCarArchetype("swagLadybug2024").cautions,
            balanceVersion: 1,
            engineType: getEngineType("swagLadybug2024"),
            drivetrain: getDrivetrain("swagLadybug2024"),
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
            aeroLevel: 0,
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
            enginePrice: 1250,
            tirePrice: 210,
            transmissionPrice: 420,
            exhaustPrice: 160,
            ecuPrice: 240,
            weightReductionPrice: 300,
            suspensionPrice: 175,
            aeroPrice: 575,
            flywheelPrice: 320,
            pistonPrice: 450,
            crankPrice: 500,
            intakePrice: 300,
            topEndPrice: 650,
            bottomEndPrice: 750,
            turboPrice: 1800,
            superchargerPrice: 1700,
            displacementPrice: 1450,
            hp: 104,
            torque: 110,
            weight: 2600,
            baseWeight: 2600,
            grip: 112,
            launchGrip: 4.2,
            dragCoefficient: 0.36,
            spd: 0,
            pos: 0,
            rpm: 1000,
            gear: 1,
            maxRPM: 6200,
            powerbandMin: 3400,
            powerbandMax: 5900,
            torqueCurve: [
                [0.00, 0.44],
                [0.22, 0.64],
                [0.44, 0.86],
                [0.66, 1.00],
                [0.84, 0.88],
                [1.00, 0.58]
            ],
            gears: 6,
            topSpeed: 118,
            gearRatios: [3.05, 1.88, 1.32, 1.02, 0.84, 0.72],
            gearMaxSpeeds: [30, 49, 69, 89, 106, 118],
            finalDrive: 3.62,
            shiftSpeed: 0.46,
            shiftTimer: 0,
            shiftRPMDrop: false,
            needleColor: "#ff3333",
            hubColor: "#ff3333",
            tachTextColor: "#ffffff",
            wheelspin: false
        };
    },
    getScholarVibratio() {
        return {
            name: "Scholar Vibratio",
            bodyId: "scholarVibratio",
            archetypeId: getCarArchetype("scholarVibratio").id,
            archetypeName: getCarArchetype("scholarVibratio").name,
            archetypeFocus: getCarArchetype("scholarVibratio").focus,
            archetypeStrengths: getCarArchetype("scholarVibratio").strengths,
            archetypeCautions: getCarArchetype("scholarVibratio").cautions,
            balanceVersion: 1,
            engineType: getEngineType("scholarVibratio"),
            drivetrain: getDrivetrain("scholarVibratio"),
            paintColor: "#ffffff",
            rimStyle: "multiSpoke",
            decalId: "none",
            decalColor: "#ffffff",
            engineLevel: 0,
            tireLevel: 0,
            transmissionLevel: 0,
            exhaustLevel: 0,
            ecuLevel: 0,
            weightReductionLevel: 0,
            suspensionLevel: 0,
            aeroLevel: 0,
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
            enginePrice: 1350,
            tirePrice: 290,
            transmissionPrice: 520,
            exhaustPrice: 180,
            ecuPrice: 300,
            weightReductionPrice: 360,
            suspensionPrice: 220,
            aeroPrice: 575,
            flywheelPrice: 330,
            pistonPrice: 450,
            crankPrice: 500,
            intakePrice: 300,
            topEndPrice: 650,
            bottomEndPrice: 750,
            turboPrice: 1800,
            superchargerPrice: 1700,
            displacementPrice: 1450,
            hp: 132,
            torque: 126,
            weight: 3050,
            baseWeight: 3050,
            grip: 138,
            launchGrip: 5.8,
            dragCoefficient: 0.36,
            spd: 0,
            pos: 0,
            rpm: 1000,
            gear: 1,
            maxRPM: 6500,
            powerbandMin: 3200,
            powerbandMax: 5900,
            torqueCurve: [
                [0.00, 0.56],
                [0.22, 0.82],
                [0.42, 1.00],
                [0.64, 0.94],
                [0.84, 0.78],
                [1.00, 0.55]
            ],
            gears: 6,
            topSpeed: 126,
            gearRatios: [3.35, 2.05, 1.44, 1.10, 0.88, 0.74],
            gearMaxSpeeds: [29, 47, 65, 84, 105, 126],
            finalDrive: 3.9,
            shiftSpeed: 0.48,
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
            archetypeId: getCarArchetype("rouletteBlair").id,
            archetypeName: getCarArchetype("rouletteBlair").name,
            archetypeFocus: getCarArchetype("rouletteBlair").focus,
            archetypeStrengths: getCarArchetype("rouletteBlair").strengths,
            archetypeCautions: getCarArchetype("rouletteBlair").cautions,
            balanceVersion: 4,
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
            aeroLevel: 0,
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
            aeroPrice: 575,
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
            dragCoefficient: 0.39,
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
            archetypeId: getCarArchetype("rouletteMontBlanc").id,
            archetypeName: getCarArchetype("rouletteMontBlanc").name,
            archetypeFocus: getCarArchetype("rouletteMontBlanc").focus,
            archetypeStrengths: getCarArchetype("rouletteMontBlanc").strengths,
            archetypeCautions: getCarArchetype("rouletteMontBlanc").cautions,
            balanceVersion: 4,
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
            dragCoefficient: 0.46,
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
            aeroLevel: 0,
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
            aeroPrice: 575,
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
        car.gearMaxSpeeds = [32, 52, 74, 98, 122];
        return car;
    },
    getHannaCivilian() {
        return {
            name: "Hanna Civilian",
            bodyId: "hannaCivilian",
            archetypeId: getCarArchetype("hannaCivilian").id,
            archetypeName: getCarArchetype("hannaCivilian").name,
            archetypeFocus: getCarArchetype("hannaCivilian").focus,
            archetypeStrengths: getCarArchetype("hannaCivilian").strengths,
            archetypeCautions: getCarArchetype("hannaCivilian").cautions,
            balanceVersion: 5,
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
            aeroLevel: 0,
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
            aeroPrice: 575,
            flywheelPrice: 360,
            pistonPrice: 450,
            crankPrice: 500,
            intakePrice: 300,
            topEndPrice: 650,
            bottomEndPrice: 750,
            turboPrice: 1800,
            superchargerPrice: 1700,
            displacementPrice: 1450,
            hp: 98,
            torque: 94,
            weight: 2700,
            baseWeight: 2700,
            grip: 96,
            launchGrip: 3.8,
            dragCoefficient: 0.34,
            spd: 0,
            pos: 0,
            rpm: 1000,
            gear: 1,
            maxRPM: 7000,
            powerbandMin: 4500,
            powerbandMax: 6600,
            torqueCurve: [
                [0.00, 0.34],
                [0.24, 0.50],
                [0.46, 0.70],
                [0.68, 0.84],
                [0.88, 0.78],
                [1.00, 0.54]
            ],
            gears: 6,
            topSpeed: 104,
            gearRatios: [
                2.92,
                1.82,
                1.35,
                1.05,
                0.92,
                0.84
            ],
            gearMaxSpeeds: [34, 54, 73, 89, 98, 104],
            finalDrive: 3.74,
            shiftSpeed: 0.56,
            shiftTimer: 0,
            shiftRPMDrop: false,
            needleColor: "#ff3333",
            hubColor: "#ff3333",
            tachTextColor: "#ffffff",
            wheelspin: false
        };
    },
};
