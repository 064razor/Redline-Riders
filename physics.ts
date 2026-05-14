import { Game } from "./game.js";
import { Input } from "./input.js";

export const Physics = {
    update(car: any, dt: number) {

        if (!dt) dt = 0.016;
        if (!car) return;

        // ===== GEAR SAFETY =====
        if (!car.gear || car.gear < 1) {
            car.gear = 1;
        }

        if (car.gear > car.gearRatios.length) {
            car.gear = car.gearRatios.length;
        }

        // ===== CURRENT GEAR DATA =====
        const gearIndex =
            car.gear - 1;

        const gearRatio =
            car.gearRatios[gearIndex] || car.gearRatios[0];

        const gearMaxSpeed =
            (car.gearMaxSpeeds[gearIndex] || car.topSpeed) / 20;

        const maxCarSpeed =
            car.topSpeed / 20;
			
		// Prevent tach from freezing before redline
        // when vehicle top speed is lower than gear max speed.
		const effectiveGearMaxSpeed =
			Math.min(gearMaxSpeed, maxCarSpeed);

        // ===== COUNTDOWN REV CONTROL =====
        if (Game.countdownActive && car === Game.playerCar) {

            if (Input.holdingThrottle) {
                car.rpm += 4000 * dt;
            }
            else {
                car.rpm -= 2500 * dt;
            }

            if (car.rpm < 1000) car.rpm = 1000;
            if (car.rpm > car.maxRPM) car.rpm = car.maxRPM;

            return;
        }

        // ===== RPM FROM CURRENT GEAR SPEED WINDOW =====			
            const previousGearMaxSpeed =
				gearIndex === 0
					? 0
					: Math.min(
						(car.gearMaxSpeeds[gearIndex - 1] || 0) / 20,
						maxCarSpeed
					);


        const gearStartSpeed =
            gearIndex === 0
                ? 0
                : previousGearMaxSpeed * 0.72;

        const gearRange =
            Math.max( effectiveGearMaxSpeed - gearStartSpeed, 0.001);

        const gearProgress =
            Math.min(
            Math.max((car.spd - gearStartSpeed) / gearRange, 0),
            1
        );

        const targetRPM =
            1000 + gearProgress * (car.maxRPM - 1000);
			
		const gearOverrun =
			Math.max(0, car.spd - effectiveGearMaxSpeed);

		const gearOverrunPenalty =
			gearOverrun > 0
				? Math.max(0.08, 1 - gearOverrun * 1.8)
				: 1;

        car.rpm +=
            (targetRPM - car.rpm) * 0.12;

        if (car.rpm < 1000) car.rpm = 1000;
        if (car.rpm > car.maxRPM) car.rpm = car.maxRPM;

        if (car.rpm > car.maxRPM * 0.95) {
            car.rpm += (Math.random() - 0.5) * 150;
        }

        // ===== TORQUE CURVE =====
        const rpmRatio =
            car.rpm / car.maxRPM;

        let torqueFactor = 1;

        if (rpmRatio < 0.3) {
            torqueFactor = 0.65;
        }
        else if (rpmRatio < 0.6) {
            torqueFactor = 1.0;
        }
        else if (rpmRatio < 0.85) {
            torqueFactor = 1.18;
        }
        else {
            torqueFactor = 0.82;
        }

        // ===== DRIVETRAIN FORCE =====
        const driveRatio =
            gearRatio * car.finalDrive;

        const accelRatio =
            1 + ((driveRatio - 1) * 0.55);

        const powerToWeight =
			car.hp / car.weight;

		const torqueToWeight =
			car.torque / car.weight;
        
		// ==== POWER TO TORQUE CONTROLLER ====
		let accel =
			((powerToWeight * 0.52) + (torqueToWeight * 0.44)) * 15;

        accel *=
            torqueFactor *
            accelRatio *
            gearOverrunPenalty;

        // ===== SHIFT INTERRUPTION =====
        if (car.shiftTimer > 0) {
            accel *= 0.25;
        }

        // ===== TRACTION =====
        const torqueLoad =
			car.torque / car.weight;

		const launchGrip =
			car.grip * 4.5;

		const speedGrip =
			car.spd * 0.35;

		const gripLimit =
			launchGrip + speedGrip;

		const torqueSpinPressure =
			torqueLoad * 65;

		const adjustedGripLimit =
			gripLimit - torqueSpinPressure;

        if (accel > gripLimit) {
			car.wheelspin = true;

			const excessAccel =
			accel - gripLimit;

			const torqueLoad =
				car.torque / Math.max(car.weight, 1);

			const tractionLoad =
				torqueLoad / Math.max(car.grip, 0.1);

			const spinSeverity =
				Math.min(2.39, tractionLoad * 49);

			const usableSpinPower =
				Math.max(
				1.55,
				2.18 - (spinSeverity * 1.95)
			);

		accel =
			gripLimit + (excessAccel * usableSpinPower);

		car.spd *=
			1 - (spinSeverity * 0.01);
	}
	else {
		car.wheelspin = false;
	}

        // ===== DRAG =====
        const drag =
            car.spd * car.spd * 0.02;

        let totalAccel =
            accel - drag;

        totalAccel =
            Math.max(-5, Math.min(totalAccel, 35));

        car.spd +=
            totalAccel * dt;

        // ===== OVERALL VEHICLE TOP SPEED LIMIT =====
        if (car.spd > maxCarSpeed) {
            car.spd = maxCarSpeed;

            if (car.rpm > car.maxRPM * 0.96) {
                car.rpm *= 0.992;
            }
        }

        if (car.spd < 0) {
            car.spd = 0;
        }

        // ===== POSITION =====
        car.pos +=
            car.spd * dt;

        // ===== SHIFT TIMER =====
        if (car.shiftTimer > 0) {
            car.shiftTimer -= dt;

            if (car.shiftTimer < 0) {
                car.shiftTimer = 0;
            }
        }
    }
};