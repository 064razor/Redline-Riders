import { SaveSystem } from "./save.js";
import { Shop } from "./shop.js";
import { Garage } from "./garage.js";
import { UI } from "./ui.js";
import { Render } from "./render.js";
import { Physics } from "./physics.js";
export const Game = {
    ownedCars: ["maruMk5"],
    garageCars: {
        maruMk5: Garage.getMaruMk5(),
        swagGG2: Garage.getSwagGG2()
    },
    playerCar: null,
    aiCar: null,
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
    trackLength: 400,
    raceMessage: "",
    raceMessageTimer: 0,
    raceTime: 0,
    playerFinishTime: 0,
    aiFinishTime: 0,
    raceReward: 0,
    bonusReward: 0,
    raceSummaryVisible: false,
    aiLaunchRPM: 0,
    aiShiftPoint: 0,
    aiShiftBonus: 1.04,
    aiShiftDelay: 0.53,
    playerFinished: false,
    aiFinished: false,
    shop: Shop,
    loadSaveIfNeeded() {
        var _a, _b, _c;
        if (this.playerCar)
            return;
        const save = SaveSystem.loadCurrentSlot();
        if (save) {
            this.money = (_a = save.money) !== null && _a !== void 0 ? _a : 0;
            this.ownedCars = (_b = save.ownedCars) !== null && _b !== void 0 ? _b : ["maruMk5"];
            const defaultGarageCars = {
                maruMk5: Garage.getMaruMk5(),
                swagGG2: Garage.getSwagGG2(),
                rouletteBlair: Garage.getRouletteBlair()
            };
            this.garageCars = Object.assign(Object.assign({}, defaultGarageCars), ((_c = save.garageCars) !== null && _c !== void 0 ? _c : {}));
            this.playerCar =
                this.garageCars[save.selectedCarId] ||
                    this.garageCars.maruMk5;
        }
        else {
            this.garageCars = {
                maruMk5: Garage.getMaruMk5(),
                swagGG2: Garage.getSwagGG2(),
                rouletteBlair: Garage.getRouletteBlair()
            };
            this.playerCar = this.garageCars.maruMk5;
        }
    },
    start() {
        if (this.countdownActive || this.raceStarted)
            return;
        this.loadSaveIfNeeded();
        this.raceTime = 0;
        this.playerFinishTime = 0;
        this.aiFinishTime = 0;
        this.raceReward = 0;
        this.bonusReward = 0;
        this.raceSummaryVisible = false;
        this.launchBonusAwarded = false;
        const trackSelect = document.getElementById("trackSelect");
        this.trackLength = Number(trackSelect.value);
        this.raceMessage = "";
        this.raceMessageTimer = 0;
        const aiChoices = [
            Garage.getMaruMk5,
            Garage.getSwagGG2,
            Garage.getRouletteBlair
        ];
        const aiFactory = aiChoices[Math.floor(Math.random() * aiChoices.length)];
        this.aiCar = aiFactory.call(Garage);
        const aiRimStyles = [
            "classic5",
            "split6",
            "mesh",
            "deepDish",
            "star"
        ];
        this.aiCar.rimStyle =
            aiRimStyles[Math.floor(Math.random() * aiRimStyles.length)];
        const aiColors = [
            "#ffffff", "#ff3333", "#33aaff", "#33ff66",
            "#ffcc33", "#aa66ff", "#ff66cc", "#ff8833",
            "#ff6d94", "#1e0c87", "#0fb500", "#658262",
            "#62ead1", "#a27cc1", "#420068", "#776b6e",
            "#e2dbaa", "#7a7a7a", "#2d2d2d", "#d3d3d3",
            "#db8e00", "#ff5d00", "#e03e57", "#95acdb",
            "#ffff1c", "#beff8c", "#beef"
        ];
        this.aiCar.paintColor =
            aiColors[Math.floor(Math.random() * aiColors.length)];
        this.playerCar.spd = 0;
        this.playerCar.pos = 0;
        this.playerCar.rpm = 1000;
        this.playerCar.gear = 1;
        this.playerCar.shiftTimer = 0;
        this.playerCar.shiftRPMDrop = false;
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
        const difficulty = difficultySelect.value;
        if (difficulty === "easy") {
            this.aiLaunchRPM = this.aiCar.powerbandMin - 500;
            this.aiShiftPoint = this.aiCar.powerbandMax * 0.88;
            this.aiShiftBonus = 1.00;
            this.aiShiftDelay = 0.70;
        }
        else if (difficulty === "hard") {
            this.aiLaunchRPM = this.aiCar.powerbandMin + 700;
            this.aiShiftPoint = this.aiCar.powerbandMax * 0.98;
            this.aiShiftBonus = 1.07;
            this.aiShiftDelay = 0.45;
        }
        else {
            this.aiLaunchRPM = this.aiCar.powerbandMin + 300;
            this.aiShiftPoint = this.aiCar.powerbandMax * 0.94;
            this.aiShiftBonus = 1.04;
            this.aiShiftDelay = 0.53;
        }
        this.aiCar.spd = 0;
        this.aiCar.pos = 0;
        this.aiCar.rpm = this.aiLaunchRPM;
        this.aiCar.gear = 1;
        this.aiCar.shiftTimer = 0;
        this.aiCar.shiftRPMDrop = false;
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
    updateAI(dt) {
        if (!this.aiCar || !this.raceStarted)
            return;
        const car = this.aiCar;
        if (car.shiftTimer <= 0 &&
            car.gear < car.gearRatios.length &&
            car.rpm >= this.aiShiftPoint) {
            car.gear++;
            car.shiftTimer = this.aiShiftDelay;
            car.shiftRPMDrop = true;
            car.spd *= this.aiShiftBonus;
        }
    },
    loop() {
        if (this.loopRunning)
            return;
        this.loopRunning = true;
        const update = () => {
            if (this.countdownActive) {
                Physics.update(this.playerCar, 0.016);
            }
            if (this.raceStarted) {
                this.raceTime += 0.016;
                this.updateAI(0.016);
                Physics.update(this.playerCar, 0.016);
                Physics.update(this.aiCar, 0.016);
                if (!this.playerFinished &&
                    this.playerCar.pos >= this.trackLength) {
                    this.playerFinished = true;
                    this.playerFinishTime = this.raceTime;
                }
                if (!this.aiFinished &&
                    this.aiCar.pos >= this.trackLength) {
                    this.aiFinished = true;
                    this.aiFinishTime = this.raceTime;
                }
                if (!this.raceFinished &&
                    this.playerFinished &&
                    this.aiFinished) {
                    this.raceFinished = true;
                    this.raceStarted = false;
                    const playerWon = this.playerFinishTime <= this.aiFinishTime;
                    if (playerWon) {
                        this.money += 100;
                        this.raceReward = 100;
                        this.raceMessage = "You won! +$100";
                    }
                    else {
                        this.money += 25;
                        this.raceReward = 25;
                        this.raceMessage = "You lost! +$25";
                    }
                    this.money += this.bonusReward;
                    SaveSystem.save(this);
                    this.raceMessageTimer = 3;
                    this.raceSummaryVisible = true;
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
};
