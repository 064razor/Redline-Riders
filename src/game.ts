import { Garage } from "./garage.js";
import { UI } from "./ui.js";
import { Render } from "./render.js";
import { Physics } from "./physics.js";

export const Game = {
    playerCar: null as any,
    aiCar: null as any,
    raceStarted: false,
    countdownActive: false,
    countdownValue: 3,
    shiftFeedback: "",
    shiftFeedbackTimer: 0,

    start() {
        this.playerCar = Garage.getStarter();
        this.aiCar = Garage.getStarter(); // temporary (we'll fix AI later)

        this.raceStarted = false;
        this.countdownActive = true;
        this.countdownValue = 3;
        this.shiftFeedback = "";
        this.shiftFeedbackTimer = 0;

        UI.showCountdown(this.countdownValue);

        this.runCountdown();
    },

    runCountdown() {
        const interval = setInterval(() => {
            this.countdownValue--;

            if (this.countdownValue > 0) {
                UI.showCountdown(this.countdownValue);
            } else {
                clearInterval(interval);
                UI.showCountdown("GO!");

                this.raceStarted = true;
                this.loop();
            }
        }, 1000);
    },

    loop() {
        const update = () => {
            if (this.raceStarted) {
                Physics.update(this.playerCar, 0.016);
                Physics.update(this.aiCar, 0.016);

                Render.draw(this.playerCar, this.aiCar);
                UI.update(this.playerCar, this);
                
                // Decay shift feedback timer
                if (this.shiftFeedbackTimer > 0) {
                    this.shiftFeedbackTimer -= 0.016;
                }
            }

            requestAnimationFrame(update);
        };

        update();
    }
};
