import { SaveSystem } from "./save.js";
import { Menu } from "./menu.js";
import { Shop } from "./shop.js";
import { Garage, getDefaultTorqueCurve, normalizeGripRating, migrateGarageGripRatings, migrateGarageTorqueCurves, migrateGarageBalanceDefaults, migrateGaragePowerAdderCurves, migrateGarageDragCoefficients, migrateGarageArchetypes } from "./garage.js";
import { UI } from "./ui.js";
import { Render } from "./render.js";
import { Physics } from "./physics.js";
import { AudioSystem } from "./audio.js";
import { Input } from "./input.js";
import { Decals } from "./decals.js";
import { getDisplacementTorqueCurve, getEstimatedPowerAtRpm, getShiftWindow } from "./power.js";
import { Events } from "./events.js";
function normalizeHexColor(hexColor) {
    const raw = hexColor.replace("#", "");
    if (raw.length >= 6) {
        return raw.substring(0, 6);
    }
    if (raw.length >= 3) {
        return raw
            .substring(0, 3)
            .split("")
            .map(character => character + character)
            .join("");
    }
    return "ffffff";
}
function getComplementaryColor(hexColor) {
    const hex = normalizeHexColor(hexColor);
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const delta = max - min;
    let hue = 0;
    let saturation = 0;
    if (delta > 0) {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
        if (max === r) {
            hue = ((g - b) / delta) % 6;
        }
        else if (max === g) {
            hue = (b - r) / delta + 2;
        }
        else {
            hue = (r - g) / delta + 4;
        }
        hue *= 60;
        if (hue < 0) {
            hue += 360;
        }
    }
    hue = (hue + 180) % 360;
    saturation = Math.max(0.45, Math.min(0.9, saturation));
    const adjustedLightness = Math.max(0.42, Math.min(0.72, lightness));
    return hslToHex(hue, saturation, adjustedLightness);
}
function getSimilarColor(hexColor) {
    const hex = normalizeHexColor(hexColor);
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const delta = max - min;
    let hue = 0;
    let saturation = 0;
    if (delta > 0) {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
        if (max === r) {
            hue = ((g - b) / delta) % 6;
        }
        else if (max === g) {
            hue = (b - r) / delta + 2;
        }
        else {
            hue = (r - g) / delta + 4;
        }
        hue *= 60;
        if (hue < 0) {
            hue += 360;
        }
    }
    const hueOffset = Math.random() * 28 - 14;
    hue = (hue + hueOffset + 360) % 360;
    saturation = Math.max(0.5, Math.min(0.95, saturation + 0.12));
    const adjustedLightness = Math.max(0.5, Math.min(0.76, lightness + 0.08));
    return hslToHex(hue, saturation, adjustedLightness);
}
function hslToHex(hue, saturation, lightness) {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const huePrime = hue / 60;
    const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
    let r = 0;
    let g = 0;
    let b = 0;
    if (huePrime >= 0 && huePrime < 1) {
        r = chroma;
        g = x;
    }
    else if (huePrime < 2) {
        r = x;
        g = chroma;
    }
    else if (huePrime < 3) {
        g = chroma;
        b = x;
    }
    else if (huePrime < 4) {
        g = x;
        b = chroma;
    }
    else if (huePrime < 5) {
        r = x;
        b = chroma;
    }
    else {
        r = chroma;
        b = x;
    }
    const match = lightness - chroma / 2;
    const toHex = (value) => {
        const hex = Math.round((value + match) * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
export const Game = {
    ownedCars: ["maruMk5"],
    garageCars: {
        maruMk5: Garage.getMaruMk5(),
        swagGG2: Garage.getSwagGG2(),
        swagLadybug2024: Garage.getSwagLadybug2024(),
        scholarVibratio: Garage.getScholarVibratio(),
        rouletteBlair: Garage.getRouletteBlair(),
        rouletteMontBlanc: Garage.getRouletteMontBlanc(),
        hannaCivilian: Garage.getHannaCivilian()
    },
    playerCar: null,
    aiCar: null,
    selectedOpponentBodyId: "maruMk5",
    randomOpponent: false,
    runMode: "race",
    activeEventId: "",
    eventRoundIndex: 0,
    currentEventRoundWon: false,
    completedEvents: {},
    currentOpponentName: "",
    currentOpponentDifficulty: "",
    testDriveCar: null,
    preTestDriveCar: null,
    preTestDriveCarId: "",
    runCarName: "",
    practiceBestTimes: {},
    aiUnderglowChance: 0.15,
    aiSimilarUnderglowColorChance: 0.35,
    aiDecalChance: 0.55,
    aiComplementaryDecalColorChance: 0.35,
    raceStarted: false,
    countdownActive: false,
    loopRunning: false,
    countdownValue: 3,
    launchState: "",
    launchTriggered: false,
    launchTimer: 0,
    launchBonusAwarded: false,
    money: 0,
    raceFinished: false,
    trackLength: 180,
    raceMessage: "",
    raceMessageTimer: 0,
    raceTime: 0,
    raceReward: 0,
    bonusReward: 0,
    difficultyMultiplier: 1,
    distanceMultiplier: 1,
    playerFinishTime: 0,
    aiFinishTime: 0,
    totalReward: 0,
    raceSummaryVisible: false,
    stats: {
        wins: 0,
        losses: 0,
        totalMoneyEarned: 0,
        totalMoneySpent: 0,
        totalPlayTime: 0,
        carUses: {},
        carWins: {}
    },
    statsSaveTimer: 0,
    aiLaunchRPM: 0,
    aiShiftPoint: 0,
    aiShiftPointScale: 0.96,
    aiShiftBonus: 1.04,
    aiShiftDelay: 0.53,
    playerFinished: false,
    aiFinished: false,
    shop: Shop,
    opponentBodyIds: [
        "maruMk5",
        "swagGG2",
        "swagLadybug2024",
        "scholarVibratio",
        "rouletteBlair",
        "rouletteMontBlanc",
        "hannaCivilian"
    ],
    trackUnitsPerMile: 720,
    getDefaultStats() {
        return {
            wins: 0,
            losses: 0,
            totalMoneyEarned: 0,
            totalMoneySpent: 0,
            totalPlayTime: 0,
            carUses: {},
            carWins: {}
        };
    },
    getRandomEventRacerName() {
        const adjectives = [
            "Redline",
            "Slipstream",
            "Apex",
            "Nitro",
            "Throttle",
            "Overdrive",
            "Street",
            "Gearbox"
        ];
        const titles = [
            "Rookie",
            "Runner",
            "Cruiser",
            "Shifter",
            "Sprinter",
            "Chaser",
            "Pilot",
            "Driver"
        ];
        const name = adjectives[Math.floor(Math.random() * adjectives.length)] + " " +
            titles[Math.floor(Math.random() * titles.length)];
        return (name === "Cruz" ||
            name === "Rocket" ||
            name === "Pinky" ||
            name === "Little Kaizer" ||
            name === "Codex" ||
            name === "Archive" ||
            name === "Matrix" ||
            name === "Mako")
            ? "Redline Rookie"
            : name;
    },
    getActiveEvent() {
        return this.activeEventId
            ? Events.getById(this.activeEventId)
            : null;
    },
    getActiveEventRound() {
        const event = this.getActiveEvent();
        if (!event)
            return null;
        return event.rounds[this.eventRoundIndex] || null;
    },
    getEventPayout(event) {
        const completions = this.completedEvents[event.id] || 0;
        return completions > 0
            ? event.replayPayout
            : event.payout;
    },
    applyEventCarSetup(car, setup) {
        var _a;
        if (!car || !setup)
            return;
        if (setup.randomFullCustomization) {
            this.applyRandomFullCustomization(car);
        }
        if (setup.paintColor)
            car.paintColor = setup.paintColor;
        if (setup.rimStyle)
            car.rimStyle = setup.rimStyle;
        if (setup.decalId)
            car.decalId = setup.decalId;
        if (setup.decalColor)
            car.decalColor = setup.decalColor;
        if (setup.underglowColor)
            car.underglowColor = setup.underglowColor;
        if (setup.needleColor)
            car.needleColor = setup.needleColor;
        if (setup.hubColor)
            car.hubColor = setup.hubColor;
        if (setup.tachTextColor)
            car.tachTextColor = setup.tachTextColor;
        if (setup.exhaustLevel) {
            const levels = Math.max(0, Math.floor(setup.exhaustLevel));
            car.exhaustLevel =
                (car.exhaustLevel || 0) + levels;
            car.hp =
                (car.hp || 0) + (8 * levels);
        }
        if (setup.ecuLevel) {
            const levels = Math.max(0, Math.floor(setup.ecuLevel));
            car.ecuLevel =
                (car.ecuLevel || 0) + levels;
            car.hp =
                (car.hp || 0) + (5 * levels);
            car.maxRPM =
                (car.maxRPM || 0) + (55 * levels);
            car.powerbandMax =
                (car.powerbandMax || 0) + (55 * levels);
        }
        if (setup.crankLevel) {
            const levels = Math.max(0, Math.floor(setup.crankLevel));
            car.crankLevel =
                (car.crankLevel || 0) + levels;
            car.hp =
                (car.hp || 0) + (6 * levels);
            car.torque =
                (car.torque || 0) + (12 * levels);
        }
        if (setup.turboLevel) {
            const levels = Math.max(0, Math.floor(setup.turboLevel));
            car.forcedInductionType = "turbo";
            car.turboLevel =
                (car.turboLevel || 0) + levels;
            car.hp =
                (car.hp || 0) + (10 * levels);
            car.torque =
                (car.torque || 0) + (2 * levels);
            car.powerbandMax =
                (car.powerbandMax || 0) + (70 * levels);
            car.turboSpool = 0;
        }
        if (setup.superchargerLevel) {
            const levels = Math.max(0, Math.floor(setup.superchargerLevel));
            car.forcedInductionType = "supercharger";
            car.superchargerLevel =
                (car.superchargerLevel || 0) + levels;
            car.hp =
                (car.hp || 0) + (5 * levels);
            car.torque =
                (car.torque || 0) + (10 * levels);
            car.powerbandMin =
                Math.max(1000, (car.powerbandMin || 3000) - (45 * levels));
        }
        if (setup.displacementLevel) {
            const levels = Math.max(0, Math.floor(setup.displacementLevel));
            car.forcedInductionType = "displacement";
            car.displacementLevel =
                (car.displacementLevel || 0) + levels;
            car.hp =
                (car.hp || 0) + (10 * levels);
            car.torque =
                (car.torque || 0) + (18 * levels);
            car.powerbandMin =
                Math.max(1000, (car.powerbandMin || 3000) - (80 * levels));
            car.powerbandMax =
                Math.max(car.powerbandMin + 900, (car.powerbandMax || 5500) - (35 * levels));
            const baseCurve = car.baseTorqueCurve ||
                getDefaultTorqueCurve(car.bodyId);
            car.baseTorqueCurve =
                baseCurve;
            car.torqueCurve =
                getDisplacementTorqueCurve(baseCurve, car.displacementLevel || 0);
        }
        if (setup.tireLevel) {
            const levels = Math.max(0, Math.floor(setup.tireLevel));
            car.tireLevel =
                (car.tireLevel || 0) + levels;
            car.grip =
                (car.grip || 0) + (120 * levels);
        }
        if (setup.weightReductionLevel) {
            const levels = Math.max(0, Math.floor(setup.weightReductionLevel));
            car.weightReductionLevel =
                (car.weightReductionLevel || 0) + levels;
            const baseWeight = (_a = car.baseWeight) !== null && _a !== void 0 ? _a : car.weight;
            car.baseWeight =
                baseWeight;
            const minimumAllowedWeight = Math.max(1200, baseWeight * 0.55);
            car.weight =
                Math.max(minimumAllowedWeight, (car.weight || baseWeight) - (120 * levels));
        }
        if (setup.suspensionLevel) {
            const levels = Math.max(0, Math.floor(setup.suspensionLevel));
            car.suspensionLevel =
                (car.suspensionLevel || 0) + levels;
            car.grip =
                (car.grip || 0) + (10 * levels);
        }
        if (setup.aeroLevel) {
            const levels = Math.max(0, Math.floor(setup.aeroLevel));
            car.aeroLevel =
                (car.aeroLevel || 0) + levels;
            const currentDrag = Number.isFinite(car.dragCoefficient)
                ? car.dragCoefficient
                : 0.34;
            car.dragCoefficient =
                Math.max(0.24, Number((currentDrag - (0.005 * levels)).toFixed(3)));
        }
        if (setup.intakeLevel) {
            const levels = Math.max(0, Math.floor(setup.intakeLevel));
            car.intakeLevel =
                (car.intakeLevel || 0) + levels;
            car.hp =
                (car.hp || 0) + (7 * levels);
            car.torque =
                (car.torque || 0) + (4 * levels);
        }
        if (setup.topEndLevel) {
            const levels = Math.max(0, Math.floor(setup.topEndLevel));
            car.topEndLevel =
                (car.topEndLevel || 0) + levels;
            car.hp =
                (car.hp || 0) + (14 * levels);
            car.maxRPM =
                (car.maxRPM || 0) + (90 * levels);
            car.powerbandMax =
                (car.powerbandMax || 0) + (90 * levels);
        }
        if (setup.bottomEndLevel) {
            const levels = Math.max(0, Math.floor(setup.bottomEndLevel));
            car.bottomEndLevel =
                (car.bottomEndLevel || 0) + levels;
            car.hp =
                (car.hp || 0) + (8 * levels);
            car.torque =
                (car.torque || 0) + (16 * levels);
        }
        if (setup.transmissionLevel) {
            const levels = Math.max(0, Math.floor(setup.transmissionLevel));
            car.transmissionLevel =
                (car.transmissionLevel || 0) + levels;
            car.topSpeed =
                (car.topSpeed || 0) + (10 * levels);
            if (Array.isArray(car.gearMaxSpeeds)) {
                car.gearMaxSpeeds =
                    car.gearMaxSpeeds.map((speed) => speed + (10 * levels));
            }
        }
        if (setup.flywheelLevel) {
            const levels = Math.max(0, Math.floor(setup.flywheelLevel));
            car.flywheelLevel =
                (car.flywheelLevel || 0) + levels;
            car.shiftSpeed =
                Math.max(0.12, (car.shiftSpeed || 0.3) - (0.02 * levels));
        }
    },
    applyRandomFullCustomization(car) {
        const colors = [
            "#ff3355",
            "#38d9ff",
            "#ffe34a",
            "#76ff4f",
            "#b96dff",
            "#ff8a2a",
            "#f7f7f7",
            "#151515"
        ];
        const rimStyles = [
            "classic5",
            "split6",
            "mesh",
            "deepDish",
            "star",
            "hyper5",
            "cyclone",
            "haloWire",
            "bladeSix",
            "blockEight"
        ];
        const decals = Decals.options.filter(decal => decal.id !== "none");
        const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
        const decal = decals[Math.floor(Math.random() * decals.length)];
        car.paintColor = randomColor();
        car.rimStyle =
            rimStyles[Math.floor(Math.random() * rimStyles.length)];
        car.underglowColor = randomColor();
        car.needleColor = randomColor();
        car.hubColor = randomColor();
        car.tachTextColor = randomColor();
        car.decalId = decal.id;
        car.decalColor =
            decal.colorable
                ? randomColor()
                : decal.defaultColor || "#ffffff";
    },
    normalizeStats(stats) {
        var _a, _b, _c, _d, _e;
        const defaults = this.getDefaultStats();
        return {
            wins: Number((_a = stats === null || stats === void 0 ? void 0 : stats.wins) !== null && _a !== void 0 ? _a : defaults.wins),
            losses: Number((_b = stats === null || stats === void 0 ? void 0 : stats.losses) !== null && _b !== void 0 ? _b : defaults.losses),
            totalMoneyEarned: Number((_c = stats === null || stats === void 0 ? void 0 : stats.totalMoneyEarned) !== null && _c !== void 0 ? _c : defaults.totalMoneyEarned),
            totalMoneySpent: Number((_d = stats === null || stats === void 0 ? void 0 : stats.totalMoneySpent) !== null && _d !== void 0 ? _d : defaults.totalMoneySpent),
            totalPlayTime: Number((_e = stats === null || stats === void 0 ? void 0 : stats.totalPlayTime) !== null && _e !== void 0 ? _e : defaults.totalPlayTime),
            carUses: (stats === null || stats === void 0 ? void 0 : stats.carUses) && typeof stats.carUses === "object"
                ? stats.carUses
                : {},
            carWins: (stats === null || stats === void 0 ? void 0 : stats.carWins) && typeof stats.carWins === "object"
                ? stats.carWins
                : {}
        };
    },
    recordMoneySpent(amount) {
        if (!Number.isFinite(amount) || amount <= 0)
            return;
        this.stats = this.normalizeStats(this.stats);
        this.stats.totalMoneySpent += amount;
    },
    recordMoneyEarned(amount) {
        if (!Number.isFinite(amount) || amount <= 0)
            return;
        this.stats = this.normalizeStats(this.stats);
        this.stats.totalMoneyEarned += amount;
    },
    recordRaceResult(playerWon) {
        var _a;
        this.stats = this.normalizeStats(this.stats);
        if (playerWon) {
            this.stats.wins++;
            const carId = ((_a = this.playerCar) === null || _a === void 0 ? void 0 : _a.bodyId) || "";
            if (carId) {
                this.stats.carWins[carId] =
                    (this.stats.carWins[carId] || 0) + 1;
            }
        }
        else {
            this.stats.losses++;
        }
    },
    recordCarUse(car) {
        if (!(car === null || car === void 0 ? void 0 : car.bodyId))
            return;
        this.stats = this.normalizeStats(this.stats);
        this.stats.carUses[car.bodyId] =
            (this.stats.carUses[car.bodyId] || 0) + 1;
    },
    getMostUsedCarId() {
        this.stats = this.normalizeStats(this.stats);
        let bestId = "";
        let bestCount = 0;
        for (const carId of Object.keys(this.stats.carUses)) {
            const count = this.stats.carUses[carId] || 0;
            if (count > bestCount) {
                bestId = carId;
                bestCount = count;
            }
        }
        return bestId;
    },
    getMostSuccessfulCarId() {
        this.stats = this.normalizeStats(this.stats);
        let bestId = "";
        let bestCount = 0;
        for (const carId of Object.keys(this.stats.carWins)) {
            const count = this.stats.carWins[carId] || 0;
            if (count > bestCount) {
                bestId = carId;
                bestCount = count;
            }
        }
        return bestId;
    },
    getSelectedTrackLength() {
        const trackSelect = document.getElementById("trackSelect");
        if (trackSelect.value !== "custom") {
            return Number(trackSelect.value);
        }
        const customTrackInput = document.getElementById("customTrackInput");
        const customLength = Number(customTrackInput.value);
        if (!Number.isFinite(customLength)) {
            return this.trackUnitsPerMile / 4;
        }
        return Math.max(this.trackUnitsPerMile / 16, Math.min(customLength, this.trackUnitsPerMile * 2));
    },
    createOpponentCar(bodyId) {
        if (bodyId === "swagGG2") {
            return Garage.getSwagGG2();
        }
        if (bodyId === "swagLadybug2024") {
            return Garage.getSwagLadybug2024();
        }
        if (bodyId === "scholarVibratio") {
            return Garage.getScholarVibratio();
        }
        if (bodyId === "rouletteBlair") {
            return Garage.getRouletteBlair();
        }
        if (bodyId === "rouletteMontBlanc") {
            return Garage.getRouletteMontBlanc();
        }
        if (bodyId === "hannaCivilian") {
            return Garage.getHannaCivilian();
        }
        return Garage.getMaruMk5();
    },
    getTrackPerformanceWeights(trackLength = this.trackLength) {
        const lengthRatio = Math.max(0, Math.min(trackLength / this.trackUnitsPerMile, 1.5));
        const sprintBias = Math.max(0, Math.min(1 - lengthRatio * 2.4, 1));
        const longBias = Math.max(0, Math.min((lengthRatio - 0.25) / 0.75, 1));
        return {
            power: 690 + longBias * 190,
            torque: 720 - longBias * 180 + sprintBias * 80,
            grip: 24 - longBias * 7 + sprintBias * 6,
            topSpeed: 10 + longBias * 34,
            drag: 4 + longBias * 18,
            shiftSpeed: 12 - longBias * 5 + sprintBias * 5
        };
    },
    getPerformanceScore(car, trackLength = this.trackLength) {
        if (!car)
            return 1;
        const weight = Math.max(car.weight || 2500, 1);
        let peakEstimatedPower = 1;
        let usableEstimatedPower = 0;
        let powerSamples = 0;
        for (let rpm = 1000; rpm <= (car.maxRPM || 7000); rpm += 250) {
            const estimatedPower = getEstimatedPowerAtRpm(car, rpm);
            peakEstimatedPower =
                Math.max(peakEstimatedPower, estimatedPower);
            const rpmRatio = rpm / Math.max(car.maxRPM || 7000, 1000);
            if (rpmRatio >= 0.32) {
                usableEstimatedPower += estimatedPower;
                powerSamples++;
            }
        }
        const averageUsablePower = powerSamples > 0
            ? usableEstimatedPower / powerSamples
            : peakEstimatedPower;
        const lengthRatio = Math.max(0, Math.min(trackLength / this.trackUnitsPerMile, 1.5));
        const longBias = Math.max(0, Math.min((lengthRatio - 0.25) / 0.75, 1));
        const inductionType = car.forcedInductionType || "none";
        const peakShare = inductionType === "turbo"
            ? 0.32 + longBias * 0.16
            : 0.46 + longBias * 0.12;
        const scoredPower = averageUsablePower * (1 - peakShare) +
            peakEstimatedPower * peakShare;
        const powerToWeight = scoredPower / weight;
        const torqueToWeight = (car.torque || 1) / weight;
        const grip = normalizeGripRating(car.grip || 120);
        const topSpeed = (car.topSpeed || 120) / 200;
        const dragCoefficient = Math.max(0.24, Math.min(car.dragCoefficient || 0.34, 0.62));
        const aerodynamicScore = Math.max(0.72, Math.min(0.34 / dragCoefficient, 1.32));
        const shiftSpeed = Math.max(car.shiftSpeed || 0.5, 0.08);
        const shiftSpeedScore = Math.max(0.75, Math.min(0.5 / shiftSpeed, 1.5));
        const weights = this.getTrackPerformanceWeights(trackLength);
        return (powerToWeight * weights.power +
            torqueToWeight * weights.torque +
            grip * weights.grip +
            topSpeed * weights.topSpeed +
            aerodynamicScore * weights.drag +
            shiftSpeedScore * weights.shiftSpeed);
    },
    getAllowedOpponentTopSpeedRatio(difficulty) {
        const lengthRatio = Math.max(0, Math.min(this.trackLength / this.trackUnitsPerMile, 1.5));
        const longBias = Math.max(0, Math.min((lengthRatio - 0.25) / 0.75, 1));
        let baseRatio = 1.08;
        if (difficulty === "veryEasy")
            baseRatio = 0.98;
        else if (difficulty === "easy")
            baseRatio = 1.03;
        else if (difficulty === "hard")
            baseRatio = 1.14;
        else if (difficulty === "veryHard")
            baseRatio = 1.22;
        return baseRatio + longBias * 0.10;
    },
    limitOpponentTopSpeedForTrack(difficulty) {
        if (!this.playerCar || !this.aiCar)
            return;
        const playerTopSpeed = Math.max(this.playerCar.topSpeed || 100, 40);
        const maxOpponentTopSpeed = Math.max(70, Math.round(playerTopSpeed *
            this.getAllowedOpponentTopSpeedRatio(difficulty)));
        if ((this.aiCar.topSpeed || 0) <= maxOpponentTopSpeed)
            return;
        const topSpeedRatio = maxOpponentTopSpeed / Math.max(this.aiCar.topSpeed || 1, 1);
        this.aiCar.topSpeed =
            maxOpponentTopSpeed;
        if (Array.isArray(this.aiCar.gearMaxSpeeds)) {
            this.aiCar.gearMaxSpeeds =
                this.aiCar.gearMaxSpeeds.map((speed) => Math.max(20, Math.round(speed * topSpeedRatio)));
        }
    },
    getOpponentTransmissionFloorRatio(difficulty) {
        const lengthRatio = Math.max(0, Math.min(this.trackLength / this.trackUnitsPerMile, 1.5));
        const longBias = Math.max(0, Math.min((lengthRatio - 0.25) / 0.75, 1));
        let baseRatio = 0.84;
        if (difficulty === "veryEasy")
            baseRatio = 0.72;
        else if (difficulty === "easy")
            baseRatio = 0.78;
        else if (difficulty === "hard")
            baseRatio = 0.88;
        else if (difficulty === "veryHard")
            baseRatio = 0.93;
        return baseRatio + longBias * 0.08;
    },
    getOpponentTransmissionUpgradeLimit(difficulty) {
        const lengthRatio = Math.max(0, Math.min(this.trackLength / this.trackUnitsPerMile, 1.5));
        const longBias = Math.max(0, Math.min((lengthRatio - 0.25) / 0.75, 1));
        let baseLimit = 3;
        if (difficulty === "veryEasy")
            baseLimit = 1;
        else if (difficulty === "easy")
            baseLimit = 2;
        else if (difficulty === "hard")
            baseLimit = 4;
        else if (difficulty === "veryHard")
            baseLimit = 5;
        return Math.max(0, Math.round(baseLimit * longBias));
    },
    applyOpponentTransmissionForTrack(difficulty) {
        if (!this.playerCar || !this.aiCar)
            return;
        const lengthRatio = Math.max(0, Math.min(this.trackLength / this.trackUnitsPerMile, 1.5));
        if (lengthRatio <= 0.25)
            return;
        const playerTopSpeed = Math.max(this.playerCar.topSpeed || 100, 40);
        const currentTopSpeed = Math.max(this.aiCar.topSpeed || 0, 0);
        const floorTopSpeed = Math.round(playerTopSpeed *
            this.getOpponentTransmissionFloorRatio(difficulty));
        if (currentTopSpeed >= floorTopSpeed)
            return;
        const upgradeLimit = this.getOpponentTransmissionUpgradeLimit(difficulty);
        if (upgradeLimit <= 0)
            return;
        const neededUpgrades = Math.ceil((floorTopSpeed - currentTopSpeed) / 10);
        const appliedUpgrades = Math.max(0, Math.min(neededUpgrades, upgradeLimit));
        if (appliedUpgrades <= 0)
            return;
        const oldTopSpeed = currentTopSpeed;
        this.aiCar.topSpeed =
            Math.max(70, Math.min(floorTopSpeed, currentTopSpeed + appliedUpgrades * 10));
        const topSpeedRatio = this.aiCar.topSpeed / Math.max(oldTopSpeed, 1);
        if (Array.isArray(this.aiCar.gearMaxSpeeds)) {
            this.aiCar.gearMaxSpeeds =
                this.aiCar.gearMaxSpeeds.map((speed, index) => {
                    const scaledSpeed = Math.round(speed * topSpeedRatio);
                    if (index === this.aiCar.gearMaxSpeeds.length - 1) {
                        return this.aiCar.topSpeed;
                    }
                    return Math.max(20, scaledSpeed);
                });
        }
        this.aiCar.transmissionLevel =
            (this.aiCar.transmissionLevel || 0) + appliedUpgrades;
    },
    getDifficultyPerformanceRatio(difficulty) {
        if (difficulty === "veryEasy")
            return 0.72;
        if (difficulty === "easy")
            return 0.92;
        if (difficulty === "hard")
            return 1.02;
        if (difficulty === "veryHard")
            return 1.2;
        return 0.96;
    },
    scaleOpponentToPlayer(difficulty) {
        if (!this.playerCar || !this.aiCar)
            return;
        const playerScore = this.getPerformanceScore(this.playerCar, this.trackLength);
        const aiScore = this.getPerformanceScore(this.aiCar, this.trackLength);
        const targetScore = playerScore * this.getDifficultyPerformanceRatio(difficulty);
        const rawScale = Math.sqrt(targetScore / Math.max(aiScore, 1));
        const statScale = Math.max(0.62, Math.min(rawScale, 1.52));
        const speedScale = Math.max(0.78, Math.min(1 + (statScale - 1) * 0.48, 1.22));
        const gripScale = Math.max(0.72, Math.min(1 + (statScale - 1) * 0.62, 1.32));
        this.aiCar.hp =
            Math.max(45, Math.round(this.aiCar.hp * statScale));
        this.aiCar.torque =
            Math.max(40, Math.round(this.aiCar.torque * statScale));
        this.aiCar.grip =
            Math.max(35, Math.round(this.aiCar.grip * gripScale));
        this.aiCar.topSpeed =
            Math.max(70, Math.round(this.aiCar.topSpeed * speedScale));
        if (Array.isArray(this.aiCar.gearMaxSpeeds)) {
            this.aiCar.gearMaxSpeeds =
                this.aiCar.gearMaxSpeeds.map((speed) => Math.max(20, Math.round(speed * speedScale)));
        }
        this.aiCar.aiPerformanceScale =
            statScale;
        this.applyOpponentTransmissionForTrack(difficulty);
        this.limitOpponentTopSpeedForTrack(difficulty);
    },
    loadSaveIfNeeded() {
        var _a, _b, _c;
        if (this.playerCar)
            return;
        const save = SaveSystem.loadCurrentSlot();
        const defaultGarageCars = {
            maruMk5: Garage.getMaruMk5(),
            swagGG2: Garage.getSwagGG2(),
            swagLadybug2024: Garage.getSwagLadybug2024(),
            scholarVibratio: Garage.getScholarVibratio(),
            rouletteBlair: Garage.getRouletteBlair(),
            rouletteMontBlanc: Garage.getRouletteMontBlanc(),
            hannaCivilian: Garage.getHannaCivilian()
        };
        if (save) {
            this.money = (_a = save.money) !== null && _a !== void 0 ? _a : 0;
            this.ownedCars = (_b = save.ownedCars) !== null && _b !== void 0 ? _b : ["maruMk5"];
            this.garageCars = Object.assign(Object.assign({}, defaultGarageCars), ((_c = save.garageCars) !== null && _c !== void 0 ? _c : {}));
            migrateGarageGripRatings(this.garageCars);
            migrateGarageTorqueCurves(this.garageCars);
            migrateGarageBalanceDefaults(this.garageCars);
            migrateGaragePowerAdderCurves(this.garageCars);
            migrateGarageDragCoefficients(this.garageCars);
            migrateGarageArchetypes(this.garageCars);
            this.stats =
                this.normalizeStats(save.stats);
            this.completedEvents =
                save.completedEvents || {};
            this.playerCar =
                this.garageCars[save.selectedCarId] ||
                    this.garageCars.maruMk5;
        }
        else {
            this.garageCars = defaultGarageCars;
            this.playerCar = this.garageCars.maruMk5;
            this.stats =
                this.normalizeStats(this.stats);
        }
    },
    start(mode = "race", testDriveCar) {
        var _a, _b, _c;
        if (this.countdownActive || this.raceStarted)
            return;
        this.loadSaveIfNeeded();
        this.runMode = mode;
        this.testDriveCar = testDriveCar || null;
        if (this.runMode === "testDrive") {
            this.preTestDriveCar =
                this.preTestDriveCar || this.playerCar;
            this.preTestDriveCarId =
                this.preTestDriveCarId ||
                    ((_a = this.playerCar) === null || _a === void 0 ? void 0 : _a.bodyId) ||
                    "";
        }
        else {
            this.preTestDriveCar = null;
            this.preTestDriveCarId = "";
        }
        this.raceTime = 0;
        this.playerFinishTime = 0;
        this.aiFinishTime = 0;
        this.raceReward = 0;
        this.bonusReward = 0;
        this.totalReward = 0;
        this.raceSummaryVisible = false;
        this.launchBonusAwarded = false;
        Menu.hideAll();
        const activeEvent = this.runMode === "event"
            ? this.getActiveEvent()
            : null;
        this.trackLength =
            (activeEvent === null || activeEvent === void 0 ? void 0 : activeEvent.trackLength) ||
                this.getSelectedTrackLength();
        if (this.trackLength <= this.trackUnitsPerMile / 8) {
            this.distanceMultiplier = 1;
        }
        else if (this.trackLength <= this.trackUnitsPerMile / 4) {
            this.distanceMultiplier = 1.25;
        }
        else if (this.trackLength <= this.trackUnitsPerMile / 2) {
            this.distanceMultiplier = 1.6;
        }
        else if (this.trackLength <= this.trackUnitsPerMile) {
            this.distanceMultiplier = 2;
        }
        else {
            this.distanceMultiplier = 2.5;
        }
        this.raceMessage = "";
        this.raceMessageTimer = 0;
        if (this.runMode === "testDrive" && this.testDriveCar) {
            this.playerCar =
                JSON.parse(JSON.stringify(this.testDriveCar));
        }
        this.runCarName =
            ((_b = this.playerCar) === null || _b === void 0 ? void 0 : _b.name) || "";
        if (this.runMode !== "testDrive") {
            this.recordCarUse(this.playerCar);
        }
        const eventRound = this.runMode === "event"
            ? this.getActiveEventRound()
            : null;
        const hasOpponent = this.runMode === "race" ||
            this.runMode === "event";
        const opponentBodyId = eventRound
            ? eventRound.opponentBodyId
            : this.randomOpponent
                ? this.opponentBodyIds[Math.floor(Math.random() * this.opponentBodyIds.length)]
                : this.selectedOpponentBodyId;
        this.aiCar =
            hasOpponent
                ? this.createOpponentCar(opponentBodyId)
                : null;
        if (this.aiCar && eventRound) {
            this.applyEventCarSetup(this.aiCar, eventRound.carSetup);
            this.currentOpponentName =
                eventRound.racerName || this.getRandomEventRacerName();
            this.currentOpponentDifficulty =
                eventRound.aiDifficulty;
        }
        else {
            this.currentOpponentName = "";
            this.currentOpponentDifficulty = "";
        }
        const aiRimStyles = [
            "classic5",
            "split6",
            "mesh",
            "deepDish",
            "star",
            "cyclone",
            "haloWire",
            "bladeSix",
            "blockEight"
        ];
        if (this.aiCar && !eventRound) {
            this.aiCar.rimStyle =
                aiRimStyles[Math.floor(Math.random() * aiRimStyles.length)];
        }
        const aiColors = [
            "#ffffff", "#ff3333", "#33aaff", "#33ff66",
            "#ffcc33", "#aa66ff", "#ff66cc", "#ff8833",
            "#ff6d94", "#1e0c87", "#0fb500", "#658262",
            "#62ead1", "#a27cc1", "#420068", "#776b6e",
            "#e2dbaa", "#7a7a7a", "#2d2d2d", "#d3d3d3",
            "#db8e00", "#ff5d00", "#e03e57", "#95acdb",
            "#ffff1c", "#beff8c", "#beef"
        ];
        if (this.aiCar && !eventRound) {
            this.aiCar.paintColor =
                aiColors[Math.floor(Math.random() * aiColors.length)];
            if (Math.random() < this.aiSimilarUnderglowColorChance) {
                this.aiCar.underglowColor = getSimilarColor(this.aiCar.paintColor);
            }
            else {
                this.aiCar.underglowColor =
                    Math.random() < this.aiUnderglowChance
                        ? aiColors[Math.floor(Math.random() * aiColors.length)]
                        : "";
            }
        }
        const aiDecals = Decals.options.filter(decal => decal.id !== "none");
        const aiDecal = Math.random() < this.aiDecalChance
            ? aiDecals[Math.floor(Math.random() * aiDecals.length)]
            : Decals.get("none");
        if (this.aiCar && !eventRound) {
            this.aiCar.decalId = aiDecal.id;
            this.aiCar.decalColor =
                aiDecal.colorable
                    ? Math.random() < this.aiComplementaryDecalColorChance
                        ? getComplementaryColor(this.aiCar.paintColor)
                        : aiColors[Math.floor(Math.random() * aiColors.length)]
                    : "#ffffff";
        }
        this.playerCar.spd = 0;
        this.playerCar.pos = 0;
        this.playerCar.rpm = 1000;
        this.playerCar.gear = 1;
        this.playerCar.shiftTimer = 0;
        this.playerCar.shiftRPMDrop = false;
        this.playerCar.shiftJoltTimer = 0;
        this.playerCar.shiftJoltStrength = 0;
        this.playerCar.boostPsi = 0;
        this.playerCar.turboSpool = 0;
        this.playerCar.brakeDive = 0;
        if (this.aiCar) {
            this.aiCar.spd = 0;
            this.aiCar.pos = 0;
            this.aiCar.rpm = 1000;
            this.aiCar.gear = 1;
            this.aiCar.shiftTimer = 0;
            this.aiCar.shiftRPMDrop = false;
            this.aiCar.shiftJoltTimer = 0;
            this.aiCar.shiftJoltStrength = 0;
            this.aiCar.boostPsi = 0;
            this.aiCar.turboSpool = 0;
            this.aiCar.brakeDive = 0;
        }
        this.raceStarted = false;
        this.countdownActive = true;
        this.countdownValue = 3;
        this.launchState = "";
        this.launchTriggered = false;
        this.launchTimer = 0;
        this.raceFinished = false;
        this.playerFinished = false;
        this.aiFinished = false;
        const difficultySelect = document.getElementById("difficultySelect");
        const difficulty = eventRound
            ? eventRound.aiDifficulty
            : difficultySelect.value;
        this.difficultyMultiplier = 1.25;
        if (difficulty === "veryEasy") {
            this.difficultyMultiplier = 0.85;
        }
        if (difficulty === "easy") {
            this.difficultyMultiplier = 1;
        }
        if (difficulty === "hard") {
            this.difficultyMultiplier = 1.55;
        }
        if (difficulty === "veryHard") {
            this.difficultyMultiplier = 1.9;
        }
        if (this.aiCar && !eventRound) {
            this.scaleOpponentToPlayer(difficulty);
        }
        const aiShiftWindow = this.aiCar ? getShiftWindow(this.aiCar) : null;
        if (this.aiCar && difficulty === "veryEasy") {
            this.aiLaunchRPM = aiShiftWindow.goodStart - 900;
            this.aiShiftPoint = aiShiftWindow.recommendedShiftRPM * 0.86;
            this.aiShiftPointScale = 0.86;
            this.aiShiftBonus = 0.98;
            this.aiShiftDelay = 0.82;
        }
        else if (this.aiCar && difficulty === "easy") {
            this.aiLaunchRPM = aiShiftWindow.goodStart - 500;
            this.aiShiftPoint = aiShiftWindow.recommendedShiftRPM * 0.92;
            this.aiShiftPointScale = 0.92;
            this.aiShiftBonus = 1.00;
            this.aiShiftDelay = 0.70;
        }
        else if (this.aiCar && difficulty === "hard") {
            this.aiLaunchRPM = aiShiftWindow.goodStart + 700;
            this.aiShiftPoint = aiShiftWindow.recommendedShiftRPM * 0.99;
            this.aiShiftPointScale = 0.99;
            this.aiShiftBonus = 1.07;
            this.aiShiftDelay = 0.45;
        }
        else if (this.aiCar && difficulty === "veryHard") {
            this.aiLaunchRPM = aiShiftWindow.goodStart + 950;
            this.aiShiftPoint = aiShiftWindow.recommendedShiftRPM * 1.01;
            this.aiShiftPointScale = 1.01;
            this.aiShiftBonus = 1.10;
            this.aiShiftDelay = 0.34;
        }
        else if (this.aiCar) {
            this.aiLaunchRPM = aiShiftWindow.goodStart + 120;
            this.aiShiftPoint = aiShiftWindow.recommendedShiftRPM * 0.94;
            this.aiShiftPointScale = 0.94;
            this.aiShiftBonus = 1.00;
            this.aiShiftDelay = 0.60;
        }
        if (this.aiCar) {
            this.aiLaunchRPM =
                Math.max(1000, Math.min(this.aiLaunchRPM, this.aiCar.maxRPM * 0.92));
            this.aiShiftPoint =
                Math.max(1000, Math.min(this.aiShiftPoint, this.aiCar.maxRPM * 0.995));
            this.aiCar.rpm = this.aiLaunchRPM;
        }
        if (eventRound) {
            const event = this.getActiveEvent();
            this.raceMessage =
                `${(event === null || event === void 0 ? void 0 : event.name) || "Event"} ${this.eventRoundIndex + 1}/${(event === null || event === void 0 ? void 0 : event.rounds.length) || 1}: ` +
                    `${this.currentOpponentName} in ${((_c = this.aiCar) === null || _c === void 0 ? void 0 : _c.name) || "Unknown"}`;
        }
        UI.showCountdown(this.countdownValue);
        AudioSystem.playCountdownBeep(false);
        this.loop();
        this.runCountdown();
    },
    startEvent(eventId) {
        const event = Events.getById(eventId);
        if (!event) {
            this.raceMessage = "Event missing.";
            this.raceMessageTimer = 2;
            return;
        }
        this.activeEventId = event.id;
        this.eventRoundIndex = 0;
        this.currentEventRoundWon = false;
        this.start("event");
    },
    continueEvent() {
        const event = this.getActiveEvent();
        if (!event)
            return;
        if (!this.currentEventRoundWon) {
            this.start("event");
            return;
        }
        this.eventRoundIndex++;
        this.currentEventRoundWon = false;
        if (this.eventRoundIndex >= event.rounds.length) {
            this.activeEventId = "";
            this.eventRoundIndex = 0;
            Menu.showPanel("eventPanel");
            if (window.syncEventUI) {
                window.syncEventUI();
            }
            return;
        }
        this.start("event");
    },
    runCountdown() {
        const interval = setInterval(() => {
            this.countdownValue--;
            if (this.countdownValue > 0) {
                UI.showCountdown(this.countdownValue);
                AudioSystem.playCountdownBeep(false);
                return;
            }
            clearInterval(interval);
            UI.showCountdown("GO!");
            AudioSystem.playCountdownBeep(true);
            this.countdownActive = false;
            setTimeout(() => {
                UI.showCountdown("");
            }, 800);
            const rpm = this.playerCar.rpm;
            const max = this.playerCar.maxRPM;
            if (rpm < max * 0.45) {
                this.launchState = "Early Launch";
            }
            else if (rpm < max * 0.75) {
                this.launchState = "Good Launch";
            }
            else if (rpm < max * 0.9) {
                this.launchState = "Perfect Launch";
            }
            else {
                this.launchState = "Rough Launch";
            }
            if (!this.launchBonusAwarded) {
                if (this.launchState === "Good Launch") {
                    this.bonusReward += 2;
                }
                if (this.launchState === "Perfect Launch") {
                    this.bonusReward += 5;
                }
                this.launchBonusAwarded = true;
            }
            this.launchTriggered = true;
            this.launchTimer = 1.5;
            this.raceStarted = true;
            UI.triggerLaunchFeedback(this.launchState);
        }, 1000);
    },
    triggerShiftJolt(car, strength = 1) {
        if (!car)
            return;
        car.shiftJoltDuration = 0.18;
        car.shiftJoltTimer = car.shiftJoltDuration;
        car.shiftJoltStrength = strength;
    },
    updateShiftJolt(car, dt) {
        if (!car || !car.shiftJoltTimer)
            return;
        car.shiftJoltTimer -= dt;
        if (car.shiftJoltTimer <= 0) {
            car.shiftJoltTimer = 0;
            car.shiftJoltStrength = 0;
        }
    },
    updateAI(dt) {
        if (!this.aiCar || !this.raceStarted || this.aiFinished)
            return;
        const car = this.aiCar;
        if (car.shiftTimer <= 0 &&
            car.gear < car.gearRatios.length &&
            car.rpm >=
                getShiftWindow(car, car.gear).recommendedShiftRPM *
                    this.aiShiftPointScale) {
            car.gear++;
            car.shiftTimer = this.aiShiftDelay;
            car.shiftRPMDrop = true;
            car.spd *= this.aiShiftBonus;
            this.triggerShiftJolt(car, 0.85);
        }
    },
    updateFinishedCoast(car, dt) {
        if (!car)
            return;
        if (car.spd <= 0) {
            car.brakeDive =
                (car.brakeDive || 0) * Math.max(0, 1 - dt * 2.2);
            if (car.brakeDive < 0.01) {
                car.brakeDive = 0;
            }
            return;
        }
        const speedBeforeBrake = car.spd;
        const weightFactor = Math.max(0.7, Math.min((car.weight || 3000) / 3000, 1.6));
        const baseDecel = 5 / weightFactor;
        const speedDecel = (car.spd * 0.35) / weightFactor;
        car.spd -=
            (baseDecel + speedDecel) * dt;
        if (car.spd < 0) {
            car.spd = 0;
        }
        const decelStep = Math.max(0, speedBeforeBrake - car.spd);
        const diveFromMomentum = speedBeforeBrake * 0.018;
        const diveFromBrakeForce = decelStep * 5.5;
        const targetDive = car.spd > 0
            ? Math.min(1, diveFromMomentum + diveFromBrakeForce)
            : 0;
        const settleRate = targetDive > (car.brakeDive || 0) ? 4.5 : 3.8;
        car.brakeDive =
            (car.brakeDive || 0) +
                (targetDive - (car.brakeDive || 0)) *
                    Math.min(1, dt * settleRate);
        if (car.brakeDive < 0.01) {
            car.brakeDive = 0;
        }
        car.pos +=
            car.spd * dt;
    },
    awardRace(playerWon) {
        if (this.raceSummaryVisible)
            return;
        if (this.runMode === "practice" || this.runMode === "testDrive") {
            const runLabel = this.runMode === "testDrive"
                ? "Test Drive"
                : "Practice";
            const bestKey = this.playerCar.bodyId + ":" + this.trackLength;
            const previousBest = this.practiceBestTimes[bestKey] || 0;
            if (this.playerFinishTime > 0 &&
                (previousBest <= 0 || this.playerFinishTime < previousBest)) {
                this.practiceBestTimes[bestKey] = this.playerFinishTime;
            }
            this.raceReward = 0;
            this.totalReward = 0;
            this.raceMessage =
                runLabel + " complete";
            this.raceMessageTimer = 3;
            this.raceSummaryVisible = true;
            return;
        }
        if (this.runMode === "event") {
            const event = this.getActiveEvent();
            const eventComplete = !!event &&
                playerWon &&
                this.eventRoundIndex >= event.rounds.length - 1;
            this.currentEventRoundWon = playerWon;
            this.raceReward =
                eventComplete && event
                    ? this.getEventPayout(event)
                    : 0;
            this.totalReward =
                this.raceReward;
            if (eventComplete && event) {
                this.money += this.totalReward;
                this.recordMoneyEarned(this.totalReward);
                this.completedEvents[event.id] =
                    (this.completedEvents[event.id] || 0) + 1;
            }
            this.recordRaceResult(playerWon);
            this.raceMessage =
                playerWon
                    ? eventComplete
                        ? "Event complete! +$" + this.totalReward
                        : "Event round won!"
                    : "Event round lost.";
            this.raceMessageTimer = 3;
            this.raceSummaryVisible = true;
            SaveSystem.save(this);
            return;
        }
        this.raceReward = playerWon ? 100 : 25;
        this.totalReward = Math.floor((this.raceReward + this.bonusReward)
            * this.difficultyMultiplier
            * this.distanceMultiplier);
        this.money += this.totalReward;
        this.recordMoneyEarned(this.totalReward);
        this.recordRaceResult(playerWon);
        this.raceMessage =
            playerWon
                ? "You won! +$" + this.totalReward
                : "You lost! +$" + this.totalReward;
        this.raceMessageTimer = 3;
        this.raceSummaryVisible = true;
        SaveSystem.save(this);
    },
    loop() {
        if (this.loopRunning)
            return;
        this.loopRunning = true;
        const update = () => {
            const dt = 0.016;
            this.stats = this.normalizeStats(this.stats);
            this.stats.totalPlayTime += dt;
            this.statsSaveTimer += dt;
            if (this.statsSaveTimer >= 30) {
                this.statsSaveTimer = 0;
                SaveSystem.save(this);
            }
            this.updateShiftJolt(this.playerCar, dt);
            this.updateShiftJolt(this.aiCar, dt);
            if (this.countdownActive) {
                Physics.update(this.playerCar, dt);
            }
            if ((this.countdownActive || this.raceStarted) &&
                !this.playerFinished) {
                AudioSystem.updateEngine(this.playerCar, Input.holdingThrottle);
            }
            else {
                AudioSystem.stopEngine();
            }
            if (this.aiCar &&
                (this.countdownActive || this.raceStarted) &&
                !this.aiFinished) {
                AudioSystem.updateOpponentEngine(this.aiCar);
            }
            else {
                AudioSystem.stopOpponentEngine();
            }
            if (this.raceStarted) {
                this.raceTime += dt;
                if (this.aiCar) {
                    this.updateAI(dt);
                }
                if (!this.playerFinished) {
                    Physics.update(this.playerCar, dt);
                }
                else {
                    this.updateFinishedCoast(this.playerCar, dt);
                }
                if (this.aiCar && !this.aiFinished) {
                    Physics.update(this.aiCar, dt);
                }
                else if (this.aiCar) {
                    this.updateFinishedCoast(this.aiCar, dt);
                }
                if (!this.playerFinished &&
                    this.playerCar.pos >= this.trackLength) {
                    this.playerFinished = true;
                    this.playerFinishTime = this.raceTime;
                    const playerWon = !this.aiCar ||
                        !this.aiFinished ||
                        (this.aiFinishTime > 0 &&
                            this.playerFinishTime <= this.aiFinishTime);
                    this.awardRace(playerWon);
                    this.raceFinished = true;
                    this.raceStarted = false;
                    AudioSystem.stopEngine();
                }
                if (this.aiCar &&
                    !this.aiFinished &&
                    this.aiCar.pos >= this.trackLength) {
                    this.aiFinished = true;
                    this.aiFinishTime = this.raceTime;
                }
            }
            else if (this.raceFinished) {
                if (this.playerFinished && this.aiCar && !this.aiFinished) {
                    this.raceTime += dt;
                }
                if (this.playerFinished) {
                    this.updateFinishedCoast(this.playerCar, dt);
                }
                if (this.aiCar && !this.aiFinished) {
                    Physics.update(this.aiCar, dt);
                    if (this.aiCar.pos >= this.trackLength) {
                        this.aiFinished = true;
                        this.aiFinishTime = this.raceTime;
                    }
                }
                else if (this.aiCar) {
                    this.updateFinishedCoast(this.aiCar, dt);
                }
            }
            if (this.launchTimer > 0) {
                this.launchTimer -= 0.016;
                if (this.launchTimer <= 0) {
                    this.launchTriggered = false;
                }
            }
            if (this.raceMessageTimer > 0) {
                this.raceMessageTimer -= 0.016;
                if (this.raceMessageTimer <= 0) {
                    this.raceMessageTimer = 0;
                    this.raceMessage = "";
                }
            }
            Render.draw(this.playerCar, this.aiCar);
            UI.update(this.playerCar, this);
            requestAnimationFrame(update);
        };
        update();
    },
    restoreTestDriveCar() {
        if (!this.preTestDriveCar && !this.preTestDriveCarId)
            return;
        const restoredCar = this.preTestDriveCarId && this.garageCars[this.preTestDriveCarId]
            ? this.garageCars[this.preTestDriveCarId]
            : this.preTestDriveCar;
        if (!restoredCar)
            return;
        this.playerCar = restoredCar;
        this.preTestDriveCar = null;
        this.preTestDriveCarId = "";
        this.testDriveCar = null;
        this.runMode = "race";
        this.aiCar = null;
        this.raceStarted = false;
        this.countdownActive = false;
        if (window.syncGarageUI) {
            window.syncGarageUI();
        }
        if (window.syncShopUI) {
            window.syncShopUI();
        }
    }
};
