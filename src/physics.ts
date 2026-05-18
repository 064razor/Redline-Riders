import { Game } from "./game.js";
import { Input } from "./input.js";
import { mphToSpeed, SPEED_FEEL_SCALE } from "./speed.js";
import { normalizeGripRating } from "./garage.js";
import { clamp, getBoostTorqueMultiplier, getCurveMultiplier } from "./power.js";

function getThrottleInput(car: any) {
    if (Game.countdownActive && car === Game.playerCar) {
        return Input.holdingThrottle ? 1 : 0;
    }

    if (Game.raceStarted) {
        return 1;
    }

    return 0;
}

function updateBoost(car: any, rpmRatio: number, dt: number) {
    if (!car) return 0;

    const inductionType =
        car.forcedInductionType || "none";

    if (inductionType !== "turbo" && inductionType !== "supercharger") {
        car.boostPsi = 0;
        return 0;
    }

    const throttle =
        getThrottleInput(car);

    const level =
        inductionType === "turbo"
            ? Math.max(car.turboLevel || 1, 1)
            : Math.max(car.superchargerLevel || 1, 1);

    const maxBoostPsi =
        inductionType === "turbo"
            ? 5.5 + level * 2.25
            : 3.25 + level * 1.35;

    const rpmBoostFactor =
        inductionType === "turbo"
            ? clamp((rpmRatio - 0.38) / 0.44, 0, 1)
            : clamp((rpmRatio - 0.12) / 0.76, 0, 1);

    let boostShape =
        0.34 + Math.pow(rpmBoostFactor, 0.72) * 0.66;

    if (inductionType === "turbo") {
        const load =
            throttle *
            clamp((rpmRatio - 0.28) / 0.52, 0, 1);

        const targetSpool =
            load * rpmBoostFactor;

        const currentSpool =
            clamp(car.turboSpool || 0, 0, 1);

        const spoolRate =
            (0.9 + level * 0.18) *
            (car.shiftTimer > 0 ? 0.34 : 1);

        const unspoolRate =
            car.shiftTimer > 0
                ? 0.85
                : 1.75;

        if (targetSpool > currentSpool) {
            car.turboSpool +=
                (targetSpool - currentSpool) *
                clamp(spoolRate * dt, 0, 1);
        }
        else {
            car.turboSpool -=
                (currentSpool - targetSpool) *
                clamp(unspoolRate * dt, 0, 1);
        }

        car.turboSpool =
            clamp(car.turboSpool || 0, 0, 1);

        boostShape =
            Math.pow(rpmBoostFactor, 1.45) *
            (0.28 + car.turboSpool * 0.72);
    }
    else {
        car.turboSpool = 0;
        boostShape =
            0.34 + Math.pow(rpmBoostFactor, 0.72) * 0.66;
    }

    const targetBoost =
        maxBoostPsi * boostShape * throttle;

    const response =
        inductionType === "turbo"
            ? 1.1 + level * 0.18
            : 8.5;

    const bleed =
        inductionType === "turbo"
            ? 5.8
            : 10.5;

    const currentBoost =
        Math.max(car.boostPsi || 0, 0);

    if (targetBoost > currentBoost) {
        car.boostPsi +=
            (targetBoost - currentBoost) * clamp(response * dt, 0, 1);
    }
    else {
        car.boostPsi -=
            (currentBoost - targetBoost) * clamp(bleed * dt, 0, 1);
    }

    car.boostPsi =
        clamp(car.boostPsi || 0, 0, maxBoostPsi);

    return car.boostPsi;
}


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
            mphToSpeed(car.gearMaxSpeeds[gearIndex] || car.topSpeed);

        const maxCarSpeed =
            mphToSpeed(car.topSpeed);

        const weightRatio =
            Math.max(car.weight || 2800, 1) / 2800;

        const weightAccelFactor =
            Math.max(
                0.72,
                Math.min(Math.pow(1 / weightRatio, 0.52), 1.26)
            );

        const weightGripFactor =
            Math.max(
                0.78,
                Math.min(Math.pow(1 / weightRatio, 0.42), 1.24)
            );

        const spinWeightPenalty =
            Math.max(
                0.82,
                Math.min(Math.pow(weightRatio, 0.52), 1.34)
            );
			
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
						mphToSpeed(car.gearMaxSpeeds[gearIndex - 1] || 0),
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
				? Math.max(0, 1 - gearOverrun * (3.8 / SPEED_FEEL_SCALE))
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

        const curveMultiplier =
            getCurveMultiplier(car.torqueCurve, rpmRatio);

        const boostPsi =
            updateBoost(car, rpmRatio, dt);

        const boostTorqueMultiplier =
            getBoostTorqueMultiplier(car, boostPsi, rpmRatio);

        const liveTorque =
            Math.max(
                1,
                (car.torque || 1) *
                curveMultiplier *
                boostTorqueMultiplier
            );

        car.liveTorque =
            liveTorque;

        car.liveHorsepower =
            Math.max(
                1,
                liveTorque * Math.max(car.rpm, 1000) / 5252
            );

        const highRpmPowerAccess =
            clamp((rpmRatio - 0.32) / 0.5, 0, 1);

        // ===== DRIVETRAIN FORCE =====
        const driveRatio =
            gearRatio * car.finalDrive;

        const accelRatio =
            1 + ((driveRatio - 1) * 0.55);

		const torqueToWeight =
			liveTorque / car.weight;

        const powerToWeight =
			(
                ((car.liveHorsepower || 1) * 0.72) +
                ((car.hp || 1) * highRpmPowerAccess * 0.28)
            ) / car.weight;
        
		// ==== POWER TO TORQUE CONTROLLER ====
		let accel =
			((powerToWeight * 0.52) + (torqueToWeight * 0.44)) *
            15 *
            SPEED_FEEL_SCALE;

        accel *=
            accelRatio *
            gearOverrunPenalty *
            weightAccelFactor;

        // ===== SHIFT INTERRUPTION =====
        if (car.shiftTimer > 0) {
            accel *= 0.25;
        }

        // ===== TRACTION =====
        const torqueLoad =
            liveTorque / car.weight;

        const gripRating =
            normalizeGripRating(car.grip);

        const effectiveGrip =
            (gripRating / 3) * weightGripFactor;

        const lowGripPenalty =
            Math.max(
                1,
                Math.min(Math.pow(120 / Math.max(gripRating, 1), 0.45), 1.85)
            );

        const drivetrain =
            car.drivetrain ||
            (
                car.bodyId === "swagGG2" ||
                car.bodyId === "hannaCivilian"
                    ? "FWD"
                    : "RWD"
            );

        const launchSpeed =
            mphToSpeed(60);

        const launchPhase =
            1 - Math.min(car.spd / launchSpeed, 1);

        const rollingGripPhase =
            Math.sqrt(Math.min(car.spd / mphToSpeed(85), 1));

        const gearTractionRelief =
            Math.min(Math.max((car.gear - 1) * 0.24, 0), 0.78);

        const accelerationLoad =
            Math.min(Math.max(accel / (35 * SPEED_FEEL_SCALE), 0), 1);

        let drivetrainGripMultiplier = 1;
        let drivetrainSpinPressure = 1;
        let drivetrainSpinSeverity = 1;
        let drivetrainSpinRecovery = 1;

        if (drivetrain === "FWD") {
            drivetrainGripMultiplier =
                1 - launchPhase * (0.14 + accelerationLoad * 0.16);

            drivetrainSpinPressure =
                1 + launchPhase * 0.18;

            drivetrainSpinSeverity =
                1 + launchPhase * 0.16;

            drivetrainSpinRecovery =
                0.92;
        }
        else {
            drivetrainGripMultiplier =
                1 + launchPhase * (0.18 + accelerationLoad * 0.18);

            drivetrainSpinPressure =
                1 - launchPhase * 0.08;

            drivetrainSpinSeverity =
                1 - launchPhase * 0.08;

            drivetrainSpinRecovery =
                1.04;
        }

        const launchGripTuning =
            (car.launchGrip || 4.5) / 4.5;

        const launchGrip =
            effectiveGrip *
            SPEED_FEEL_SCALE *
            (1.35 + launchPhase * 0.35 * launchGripTuning);

        const speedGrip =
            car.spd * (0.55 + rollingGripPhase * 0.75);

        const gripLimit =
            (launchGrip * drivetrainGripMultiplier) + speedGrip;

        const torqueSpinPressure =
            torqueLoad *
            65 *
            drivetrainSpinPressure *
            spinWeightPenalty *
            lowGripPenalty *
            (1 - rollingGripPhase * 0.58) *
            (1 - gearTractionRelief * 0.62);

        const adjustedGripLimit =
            Math.max(gripLimit - torqueSpinPressure, gripLimit * 0.68);

        if (accel > adjustedGripLimit) {
            const excessAccel =
                accel - adjustedGripLimit;

            const tractionLoad =
                torqueLoad / Math.max(effectiveGrip, 0.1);

            const spinSeverity =
                Math.min(
                    1.55,
                    tractionLoad *
                    34 *
                    drivetrainSpinSeverity *
                    spinWeightPenalty *
                    lowGripPenalty *
                    (1 - rollingGripPhase * 0.78) *
                    (1 - gearTractionRelief * 0.95)
                );

            car.wheelspinIntensity =
                Math.max(0, Math.min(spinSeverity / 1.55, 1));

            car.wheelspin = car.wheelspinIntensity > 0.08;

            const usableSpinPower =
                Math.max(
                    0.66,
                    (1.75 - (spinSeverity * 1.22)) *
                    drivetrainSpinRecovery /
                    (spinWeightPenalty * lowGripPenalty)
                );

            accel =
                adjustedGripLimit + (excessAccel * usableSpinPower);

            const spinSpeedPenalty =
                0.0032 *
                spinWeightPenalty *
                lowGripPenalty *
                (1 - rollingGripPhase * 0.82);

            car.spd *=
                1 - (spinSeverity * spinSpeedPenalty);
        }
        else {
            car.wheelspin = false;
            car.wheelspinIntensity = 0;
        }

        // ===== DRAG =====
        const drag =
            car.spd * car.spd * (0.02 / SPEED_FEEL_SCALE);

        let totalAccel =
            accel - drag;

        totalAccel =
            Math.max(
                -5 * SPEED_FEEL_SCALE,
                Math.min(totalAccel, 35 * SPEED_FEEL_SCALE)
            );

        if (
            car.gear < car.gearRatios.length &&
            car.shiftTimer <= 0 &&
            car.spd >= effectiveGearMaxSpeed
        ) {
            totalAccel =
                Math.min(totalAccel, -1.2 * SPEED_FEEL_SCALE);
        }

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
