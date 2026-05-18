import { SaveSystem } from "./save.js";
import { Menu } from "./menu.js";
import { Shop } from "./shop.js";
import { Garage, normalizeGripRating, migrateGarageGripRatings, migrateGarageTorqueCurves, migrateGarageBalanceDefaults, migrateGaragePowerAdderCurves } from "./garage.js";
import { UI } from "./ui.js";
import { Render } from "./render.js";
import { Physics } from "./physics.js";
import { AudioSystem } from "./audio.js";
import { Input } from "./input.js";
import { Decals } from "./decals.js";
import { getEstimatedPowerAtRpm, getShiftWindow } from "./power.js";

function normalizeHexColor(hexColor: string) {
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
function getComplementaryColor(hexColor: string) {
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


function getSimilarColor(hexColor: string) {
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
function hslToHex(hue: number, saturation: number, lightness: number) {
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
    const toHex = (value: number) => {
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
        rouletteBlair: Garage.getRouletteBlair(),
        rouletteMontBlanc: Garage.getRouletteMontBlanc(),
		hannaCivilian: Garage.getHannaCivilian()
    } as any,

    playerCar: null as any,
    aiCar: null as any,
    selectedOpponentBodyId: "maruMk5",
    randomOpponent: false,
    runMode: "race",
    testDriveCar: null as any,
    preTestDriveCar: null as any,
    runCarName: "",
    practiceBestTimes: {} as Record<string, number>,
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
        "rouletteBlair",
        "rouletteMontBlanc",
        "hannaCivilian"
    ],

    trackUnitsPerMile: 720,

    getSelectedTrackLength() {
        const trackSelect =
            document.getElementById("trackSelect") as HTMLSelectElement;

        if (trackSelect.value !== "custom") {
            return Number(trackSelect.value);
        }

        const customTrackInput =
            document.getElementById("customTrackInput") as HTMLInputElement;

        const customLength =
            Number(customTrackInput.value);

        if (!Number.isFinite(customLength)) {
            return this.trackUnitsPerMile / 4;
        }

        return Math.max(
            this.trackUnitsPerMile / 16,
            Math.min(customLength, this.trackUnitsPerMile * 2)
        );
    },

    createOpponentCar(bodyId: string) {
        if (bodyId === "swagGG2") {
            return Garage.getSwagGG2();
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

    getPerformanceScore(car: any) {
        if (!car) return 1;

        const weight =
            Math.max(car.weight || 2500, 1);

        let peakEstimatedPower = 1;

        for (let rpm = 1000; rpm <= (car.maxRPM || 7000); rpm += 250) {
            peakEstimatedPower =
                Math.max(
                    peakEstimatedPower,
                    getEstimatedPowerAtRpm(car, rpm)
                );
        }

        const powerToWeight =
            peakEstimatedPower / weight;

        const torqueToWeight =
            (car.torque || 1) / weight;

        const grip =
            normalizeGripRating(car.grip || 120);

        const topSpeed =
            (car.topSpeed || 120) / 200;

        const shiftSpeed =
            Math.max(car.shiftSpeed || 0.5, 0.08);

        const shiftSpeedScore =
            Math.max(0.75, Math.min(0.5 / shiftSpeed, 1.5));

        return (
            powerToWeight * 760 +
            torqueToWeight * 620 +
            grip * 18 +
            topSpeed * 20 +
            shiftSpeedScore * 8
        );
    },

    getDifficultyPerformanceRatio(difficulty: string) {
        if (difficulty === "veryEasy") return 0.72;
        if (difficulty === "easy") return 0.92;
        if (difficulty === "hard") return 1.02;
        if (difficulty === "veryHard") return 1.2;

        return 1;
    },

    scaleOpponentToPlayer(difficulty: string) {
        if (!this.playerCar || !this.aiCar) return;

        const playerScore =
            this.getPerformanceScore(this.playerCar);

        const aiScore =
            this.getPerformanceScore(this.aiCar);

        const targetScore =
            playerScore * this.getDifficultyPerformanceRatio(difficulty);

        const rawScale =
            Math.sqrt(targetScore / Math.max(aiScore, 1));

        const statScale =
            Math.max(0.62, Math.min(rawScale, 1.52));

        const speedScale =
            Math.max(0.78, Math.min(1 + (statScale - 1) * 0.48, 1.22));

        const gripScale =
            Math.max(0.72, Math.min(1 + (statScale - 1) * 0.62, 1.32));

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
                this.aiCar.gearMaxSpeeds.map((speed: number) =>
                    Math.max(20, Math.round(speed * speedScale))
                );
        }

        this.aiCar.aiPerformanceScale =
            statScale;
    },

    loadSaveIfNeeded() {
        if (this.playerCar) return;

        const save = SaveSystem.loadCurrentSlot();

        const defaultGarageCars = {
            maruMk5: Garage.getMaruMk5(),
            swagGG2: Garage.getSwagGG2(),
            rouletteBlair: Garage.getRouletteBlair(),
            rouletteMontBlanc: Garage.getRouletteMontBlanc(),
            hannaCivilian: Garage.getHannaCivilian()
        };

        if (save) {
            this.money = save.money ?? 0;
            this.ownedCars = save.ownedCars ?? ["maruMk5"];

            this.garageCars = {
                ...defaultGarageCars,
                ...(save.garageCars ?? {})
            };

            migrateGarageGripRatings(this.garageCars);
            migrateGarageTorqueCurves(this.garageCars);
            migrateGarageBalanceDefaults(this.garageCars);
            migrateGaragePowerAdderCurves(this.garageCars);

            this.playerCar =
                this.garageCars[save.selectedCarId] ||
                this.garageCars.maruMk5;
        }
        else {
            this.garageCars = defaultGarageCars;
            this.playerCar = this.garageCars.maruMk5;
        }
    },

    start(mode: string = "race", testDriveCar?: any) {
        if (this.countdownActive || this.raceStarted) return;

        this.loadSaveIfNeeded();
        this.runMode = mode;
        this.testDriveCar = testDriveCar || null;
        this.preTestDriveCar =
            this.runMode === "testDrive"
                ? this.preTestDriveCar || this.playerCar
                : null;

        this.raceTime = 0;
        this.playerFinishTime = 0;
        this.aiFinishTime = 0;
        this.raceReward = 0;
        this.bonusReward = 0;
        this.totalReward = 0;
        this.raceSummaryVisible = false;
        this.launchBonusAwarded = false;

        Menu.hideAll();

        this.trackLength = this.getSelectedTrackLength();

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
            this.playerCar?.name || "";

        const hasOpponent =
            this.runMode === "race";

        const opponentBodyId =
            this.randomOpponent
                ? this.opponentBodyIds[
                    Math.floor(Math.random() * this.opponentBodyIds.length)
                ]
                : this.selectedOpponentBodyId;

        this.aiCar =
            hasOpponent
                ? this.createOpponentCar(opponentBodyId)
                : null;

        const aiRimStyles = [
            "classic5",
            "split6",
            "mesh",
            "deepDish",
            "star"
        ];

        if (this.aiCar) {
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

        if (this.aiCar) {
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

        const aiDecals =
            Decals.options.filter(decal => decal.id !== "none");

        const aiDecal =
            Math.random() < this.aiDecalChance
                ? aiDecals[Math.floor(Math.random() * aiDecals.length)]
                : Decals.get("none");

        if (this.aiCar) {
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

        if (this.aiCar) {
            this.aiCar.spd = 0;
            this.aiCar.pos = 0;
            this.aiCar.rpm = 1000;
            this.aiCar.gear = 1;
            this.aiCar.shiftTimer = 0;
            this.aiCar.shiftRPMDrop = false;
            this.aiCar.shiftJoltTimer = 0;
            this.aiCar.shiftJoltStrength = 0;
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

        const difficultySelect =
            document.getElementById("difficultySelect") as HTMLSelectElement;

        const difficulty = difficultySelect.value;

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

        if (this.aiCar) {
            this.scaleOpponentToPlayer(difficulty);
        }

        const aiShiftWindow =
            this.aiCar ? getShiftWindow(this.aiCar) : null;

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
            this.aiLaunchRPM = aiShiftWindow.goodStart + 300;
            this.aiShiftPoint = aiShiftWindow.recommendedShiftRPM * 0.96;
            this.aiShiftPointScale = 0.96;
            this.aiShiftBonus = 1.04;
            this.aiShiftDelay = 0.53;
        }

        if (this.aiCar) {
            this.aiLaunchRPM =
                Math.max(1000, Math.min(this.aiLaunchRPM, this.aiCar.maxRPM * 0.92));

            this.aiShiftPoint =
                Math.max(1000, Math.min(this.aiShiftPoint, this.aiCar.maxRPM * 0.995));

            this.aiCar.rpm = this.aiLaunchRPM;
        }

        UI.showCountdown(this.countdownValue);

        this.loop();
        this.runCountdown();
    },

    runCountdown() {
        const interval = setInterval(() => {
            this.countdownValue--;

            if (this.countdownValue > 0) {
                UI.showCountdown(this.countdownValue);
                return;
            }

            clearInterval(interval);
            UI.showCountdown("GO!");

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
        }, 1000);
    },

    triggerShiftJolt(car: any, strength: number = 1) {
        if (!car) return;

        car.shiftJoltDuration = 0.18;
        car.shiftJoltTimer = car.shiftJoltDuration;
        car.shiftJoltStrength = strength;
    },

    updateShiftJolt(car: any, dt: number) {
        if (!car || !car.shiftJoltTimer) return;

        car.shiftJoltTimer -= dt;

        if (car.shiftJoltTimer <= 0) {
            car.shiftJoltTimer = 0;
            car.shiftJoltStrength = 0;
        }
    },

    updateAI(dt: number) {
        if (!this.aiCar || !this.raceStarted || this.aiFinished) return;

        const car = this.aiCar;

        if (
            car.shiftTimer <= 0 &&
            car.gear < car.gearRatios.length &&
            car.rpm >=
                getShiftWindow(car, car.gear).recommendedShiftRPM *
                this.aiShiftPointScale
        ) {
            car.gear++;
            car.shiftTimer = this.aiShiftDelay;
            car.shiftRPMDrop = true;
            car.spd *= this.aiShiftBonus;
            this.triggerShiftJolt(car, 0.85);
        }
    },

    updateFinishedCoast(car: any, dt: number) {
        if (!car || car.spd <= 0) return;

        const weightFactor =
            Math.max(
                0.7,
                Math.min((car.weight || 3000) / 3000, 1.6)
            );

        const baseDecel =
            5 / weightFactor;

        const speedDecel =
            (car.spd * 0.35) / weightFactor;

        car.spd -=
            (baseDecel + speedDecel) * dt;

        if (car.spd < 0) {
            car.spd = 0;
        }

        car.pos +=
            car.spd * dt;
    },
    awardRace(playerWon: boolean) {
        if (this.runMode === "practice" || this.runMode === "testDrive") {
            const runLabel =
                this.runMode === "testDrive"
                    ? "Test Drive"
                    : "Practice";

            const bestKey =
                this.playerCar.bodyId + ":" + this.trackLength;

            const previousBest =
                this.practiceBestTimes[bestKey] || 0;

            if (
                this.playerFinishTime > 0 &&
                (previousBest <= 0 || this.playerFinishTime < previousBest)
            ) {
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

        this.raceReward = playerWon ? 100 : 25;

        this.totalReward = Math.floor(
            (this.raceReward + this.bonusReward)
            * this.difficultyMultiplier
            * this.distanceMultiplier
        );

        this.money += this.totalReward;

        this.raceMessage =
            playerWon
                ? "You won! +$" + this.totalReward
                : "You lost! +$" + this.totalReward;

        this.raceMessageTimer = 3;
        this.raceSummaryVisible = true;

        SaveSystem.save(this);
    },

    loop() {
        if (this.loopRunning) return;
        this.loopRunning = true;

        const update = () => {
            const dt = 0.016;

            this.updateShiftJolt(this.playerCar, dt);
            this.updateShiftJolt(this.aiCar, dt);

            if (this.countdownActive) {
                Physics.update(this.playerCar, dt);
            }

            if (
                (this.countdownActive || this.raceStarted) &&
                !this.playerFinished
            ) {
                AudioSystem.updateEngine(
                    this.playerCar,
                    Input.holdingThrottle
                );
            }
            else {
                AudioSystem.stopEngine();
            }

            if (
                this.aiCar &&
                (this.countdownActive || this.raceStarted) &&
                !this.aiFinished
            ) {
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

                if (
                    !this.playerFinished &&
                    this.playerCar.pos >= this.trackLength
                ) {
                    this.playerFinished = true;
                    this.playerFinishTime = this.raceTime;

                    if (!this.aiCar && !this.raceSummaryVisible) {
                        this.awardRace(true);
                    }
                }

                if (
                    this.aiCar &&
                    !this.aiFinished &&
                    this.aiCar.pos >= this.trackLength
                ) {
                    this.aiFinished = true;
                    this.aiFinishTime = this.raceTime;
                }

                if (
                    this.aiCar &&
                    this.playerFinished &&
                    this.aiFinished &&
                    !this.raceSummaryVisible
                ) {
                    const playerWon =
                        this.playerFinishTime <= this.aiFinishTime;

                    this.awardRace(playerWon);
                }

                if (
                    !this.raceFinished &&
                    this.playerFinished &&
                    (!this.aiCar || this.aiFinished)
                ) {
                    this.raceFinished = true;
                    this.raceStarted = false;

                    AudioSystem.stopAllEngines();
                }
            }
            else if (this.raceFinished) {
                if (this.playerFinished) {
                    this.updateFinishedCoast(this.playerCar, dt);
                }

                if (this.aiCar && this.aiFinished) {
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
    }
,

    restoreTestDriveCar() {
        if (this.runMode !== "testDrive" || !this.preTestDriveCar) return;

        this.playerCar = this.preTestDriveCar;
        this.preTestDriveCar = null;
        this.testDriveCar = null;
        this.runMode = "race";
    }
};
