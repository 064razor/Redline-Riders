import { UI } from "./ui.js";
import { mphToSpeed } from "./speed.js";
import { getShiftQuality } from "./power.js";
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
                if (e.repeat)
                    return;
                // Only shift during race
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
        if (!car)
            return;
        if (car.shiftTimer > 0)
            return;
        if (car.gear >= car.gearRatios.length)
            return;
        const currentGearMaxSpeed = mphToSpeed(car.gearMaxSpeeds[car.gear - 1]);
        const currentGearProgress = car.spd / currentGearMaxSpeed;
        // Prevent panic-spamming straight into high gear at low speed.
        if (car.gear > 1 && currentGearProgress < 0.35) {
            UI.triggerShiftFeedback("STALLING!");
            return;
        }
        let result = "";
        const rpm = car.rpm;
        // ===== SHIFT QUALITY =====
        result = getShiftQuality(car, rpm, car.gear);
        // ===== GEAR RATIO RPM DROP =====
        const oldGearRatio = car.gearRatios[car.gear - 1];
        car.gear++;
        const newGearRatio = car.gearRatios[car.gear - 1];
        const ratioDrop = newGearRatio / oldGearRatio;
        car.rpm *= ratioDrop;
        if (car.rpm < 1000) {
            car.rpm = 1000;
        }
        if (car.rpm > car.maxRPM) {
            car.rpm = car.maxRPM;
        }
        // ===== SHIFT DELAY =====
        car.shiftTimer =
            car.shiftSpeed || 0.5;
        // Physics now handles RPM naturally by gear speed range.
        car.shiftRPMDrop = false;
        // ===== MOMENTUM EFFECT =====
        // Shifting should not act like a huge speed boost.
        // These are small feel adjustments only.
        let shiftJoltStrength = 0.9;
        if (result === "EARLY") {
            car.spd *= 0.985;
        }
        else if (result === "GOOD") {
            car.spd *= 1.003;
            game.bonusReward += 2;
            shiftJoltStrength = 1;
        }
        else if (result === "PERFECT") {
            car.spd *= 1.006;
            game.bonusReward += 5;
            shiftJoltStrength = 1.15;
        }
        else {
            car.spd *= 0.975;
            shiftJoltStrength = 1.05;
        }
        if (game.triggerShiftJolt) {
            game.triggerShiftJolt(car, shiftJoltStrength);
        }
        UI.triggerShiftFeedback(result);
    }
};
