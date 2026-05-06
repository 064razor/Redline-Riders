import { Garage } from "./garage";
import { UI } from "./ui";
import { Render } from "./render";
import { Physics } from "./physics";
export const Game = {
    playerCar: null,
    aiCar: null,
    raceStarted: false,
    countdownActive: false,
    countdownValue: 3,
    start() {
        this.playerCar = Garage.getStarter();
        this.aiCar = Garage.getStarter(); // temporary (we’ll fix AI later)
        this.raceStarted = false;
        this.countdownActive = true;
        this.countdownValue = 3;
        UI.showCountdown(this.countdownValue);
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
            }
            requestAnimationFrame(update);
        };
        update();
    }
};
