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
        let r = car.rpm / car.maxRPM;
        let result = "";
        let bonus = 1;
        if (r < 0.75) {
            result = "EARLY";
            bonus = 1.0;
        }
        else if (r < 0.9) {
            result = "GOOD";
            bonus = 1.05;
        }
        else if (r < 0.97) {
            result = "PERFECT";
            bonus = 1.12;
        }
        else {
            result = "LATE";
            bonus = 0.9;
        }
        car.gear++;
        car.shiftTimer = 0.35;
        car.rpm *= 0.6;
        car.spd *= bonus;
        game.shiftFeedback = result;
        game.shiftFeedbackTimer = 0.6;
    }
};
