import { UI } from "./ui.js";
console.log("input loaded");
export const Input = {
    holdingThrottle: false,
    init(game) {
        document.addEventListener("keydown", (e) => {
            // ===== THROTTLE =====
            if (e.code === "ArrowUp") {
                this.holdingThrottle = true;
            }
            // ===== SHIFT =====
            if (e.code === "Space") {
                // ✅ only shift during race
                if (!game.raceStarted)
                    return;
                this.shift(game.playerCar, game);
                if (e.repeat)
                    return;
            }
        });
        document.addEventListener("keyup", (e) => {
            if (e.code === "ArrowUp") {
                this.holdingThrottle = false;
            }
        });
    },
    shift(car, game) {
        if (!car || car.shiftTimer > 0)
            return;
        if (car.gear >= car.gearRatios.length)
            return;
        let result = "";
        let bonus = 1;
        const rpm = car.rpm;
        if (rpm < car.powerbandMin) {
            result = "EARLY";
            bonus = 0.96;
        }
        else if (rpm < car.powerbandMax * 0.92) {
            result = "GOOD";
            bonus = 1.04;
        }
        else if (rpm <= car.powerbandMax) {
            result = "PERFECT";
            bonus = 1.10;
        }
        else {
            result = "LATE";
            bonus = 0.92;
        }
        car.gear++;
        car.shiftTimer = 0.5;
        car.shiftRPMDrop = true;
        car.spd *= bonus;
        if (result === "GOOD")
            game.bonusReward += 2;
        if (result === "PERFECT")
            game.bonusReward += 5;
        if (result === "GOOD") {
            game.bonusReward += 2;
        }
        if (result === "PERFECT") {
            game.bonusReward += 5;
        }
        UI.triggerShiftFeedback(result);
    }
};
