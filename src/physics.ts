
import { Game } from "./game.js";
import { Input } from "./input.js";

export const Physics = {
    update(car: any, dt: number) {

        if (!dt) dt = 0.016;

        // ===== GEAR SAFETY =====
        if (!car.gear || car.gear < 1) car.gear = 1;
        if (car.gear > car.gearRatios.length) car.gear = car.gearRatios.length;

        // ===== BASE GEAR RATIO =====
        let gearRatio =
            car.gearRatios[car.gear - 1];

        if (!gearRatio) {
            gearRatio = car.gearRatios[0];
        }

        // ===== FINAL DRIVE FOR RPM =====
        const driveRatio =
            gearRatio * car.finalDrive;

        // ===== SOFTENED DRIVE FORCE =====
        const accelRatio =
            1 + ((driveRatio - 1) * 0.30);

        // ===== COUNTDOWN REV CONTROL =====
        if (Game.countdownActive && car === Game.playerCar) {

            if (Input.holdingThrottle) {
                car.rpm += 4000 * dt;
            } else {
                car.rpm -= 2500 * dt;
            }

            if (car.rpm < 1000) car.rpm = 1000;
            if (car.rpm > car.maxRPM) car.rpm = car.maxRPM;

            if (car.rpm > car.maxRPM * 0.9) {
                car.rpm += (Math.random() - 0.5) * 200;
            }

            return;
        }

        // ===== TARGET RPM =====
        const targetRPM =
        car.spd * driveRatio * 330;

       // ===== RPM SMOOTHING =====
       car.rpm += (targetRPM - car.rpm) * 0.12;

       // ===== SHIFT RPM DROP =====
       if (car.shiftTimer > 0 && car.shiftRPMDrop) {

           car.rpm *= 0.965;

           // Stop dropping once near target
           if (car.rpm <= targetRPM * 1.05) {
           car.shiftRPMDrop = false;
           }
       }

        if (car.rpm < 1000) car.rpm = 1000;
        if (car.rpm > car.maxRPM) car.rpm = car.maxRPM;

        if (car.rpm > car.maxRPM * 0.95) {
            car.rpm += (Math.random() - 0.5) * 150;
        }

        let rpmRatio = car.rpm / car.maxRPM;

        let torqueFactor;
        if (rpmRatio < 0.3) torqueFactor = 0.6;
        else if (rpmRatio < 0.6) torqueFactor = 1.0;
        else if (rpmRatio < 0.85) torqueFactor = 1.2;
        else torqueFactor = 0.8;

        let accel = (car.hp / car.weight) * 18;
        accel *= torqueFactor * accelRatio;
		
		// ===== SHIFT INTERRUPTION =====
        if (car.shiftTimer > 0) {
        accel *= 0.25;
        }

        let gripLimit = car.grip + (car.spd * 0.18);

        if (accel > gripLimit) {
            car.wheelspin = true;
            accel = gripLimit * 0.82;
            car.spd *= 0.998;
        } else {
            car.wheelspin = false;
        }

        let drag = car.spd * car.spd * 0.02;

        let totalAccel = accel - drag;
        totalAccel = Math.max(-5, Math.min(totalAccel, 12));

        car.spd += totalAccel * dt;

        // ===== GEAR SPEED LIMIT =====
        const gearMax =
        car.gearMaxSpeeds[car.gear - 1] / 20;

        const allowedTopSpeed =
        Math.min(gearMax, car.topSpeed);

        if (car.spd > allowedTopSpeed) {

            car.spd = allowedTopSpeed;

            // Bounce RPM against limiter
            if (car.rpm > car.maxRPM * 0.96) {
                car.rpm *= 0.985;
            }
        }
		
        if (car.spd < 0) car.spd = 0;

        car.pos += car.spd * dt;

        if (car.shiftTimer > 0) {
            car.shiftTimer -= dt;
        }
    }
};