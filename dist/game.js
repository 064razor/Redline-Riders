import { Garage } from "./garage.js";
import { UI } from "./ui.js";
import { Render } from "./render.js";
import { Physics } from "./physics.js";
export const Game = {
    playerCar: null,
    aiCar: null,
    raceStarted: false,
    countdownActive: false,
    loopRunning: false,
    countdownValue: 3,
    launchState: "",
    launchTriggered: false,
    launchTimer: 0,
    money: 0,
    start() {
        if (this.countdownActive || this.raceStarted)
            return;
        this.playerCar = Garage.getStarter();
        this.aiCar = Garage.getStarter(); // temporary (we’ll fix AI later)
        this.raceStarted = false;
        this.countdownActive = true;
        this.countdownValue = 3;
        this.launchState = "";
        this.launchTriggered = false;
        this.launchTimer = 0;
        UI.showCountdown(this.countdownValue);
        // ✅ START LOOP IMMEDIATELY
        this.loop();
        this.runCountdown();
    },
    runCountdown() {
        const interval = setInterval(() => {
            this.countdownValue--;
            if (this.countdownValue > 0) {
                UI.showCountdown(this.countdownValue);
            }
            else {
                clearInterval(interval);
                UI.showCountdown("GO!");
                this.countdownActive = false;
                // ✅ ADD THIS
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
                this.launchTriggered = true;
                this.launchTimer = 1.5;
                this.raceStarted = true;
            }
        }, 1000);
    },
    loop() {
        if (this.loopRunning)
            return;
        this.loopRunning = true;
        const update = () => {
            // physics only during race
            Physics.update(this.playerCar, 0.016);
            if (this.raceStarted) {
                Physics.update(this.aiCar, 0.016);
                // ===== SIMPLE WIN REWARD =====
                if (this.raceStarted &&
                    this.playerCar.pos >= 1000) {
                    this.money += 100;
                    this.raceStarted = false;
                    alert("You won! +$100");
                }
            }
            // launch message timer
            if (this.launchTimer > 0) {
                this.launchTimer -= 0.016;
                if (this.launchTimer <= 0) {
                    this.launchTriggered = false;
                }
            }
            // always render/update UI
            Render.draw(this.playerCar, this.aiCar);
            UI.update(this.playerCar, this);
            requestAnimationFrame(update);
        };
        update();
    }
};
