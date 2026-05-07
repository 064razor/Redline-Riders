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
            }
            // always render/update UI
            Render.draw(this.playerCar, this.aiCar);
            UI.update(this.playerCar, this);
            requestAnimationFrame(update);
        };
        update();
    }
};
