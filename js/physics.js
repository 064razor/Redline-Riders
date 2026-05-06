console.log("physics loaded");
const Physics = {
    update(car, dt) {

        if (!dt) dt = 0.016;

        // ===== GEAR SAFETY =====
        if (!car.gear || car.gear < 1) car.gear = 1;
        if (car.gear > car.gearRatios.length) car.gear = car.gearRatios.length;

        let gearRatio = car.gearRatios[car.gear - 1];
        if (!gearRatio) gearRatio = car.gearRatios[0];

        // ===== COUNTDOWN REV CONTROL =====
        if (Game.state === "countdown" && car === Game.player) {

            if (car === Game.player) {

                if (Input.holdingThrottle) {
                    car.rpm += 4000 * dt;
                } else {
                    car.rpm -= 2500 * dt;
                }

                if (car.rpm < 1000) car.rpm = 1000;
                if (car.rpm > car.maxRPM) car.rpm = car.maxRPM;

                // redline wobble
                if (car.rpm > car.maxRPM * 0.9) {
                    car.rpm += (Math.random() - 0.5) * 200;
                }
            }

            return;
        }

        // ===== RPM CALC =====
        car.rpm = car.spd * gearRatio * 1000;

        if (car.rpm < 1000) car.rpm = 1000;
        if (car.rpm > car.maxRPM) car.rpm = car.maxRPM;

        // ===== REDLINE WOBBLE =====
        if (car.rpm > car.maxRPM * 0.95) {
            car.rpm += (Math.random() - 0.5) * 150;
        }

        // ===== TORQUE CURVE =====
        let rpmRatio = car.rpm / car.maxRPM;

        let torqueFactor;
        if (rpmRatio < 0.3) torqueFactor = 0.6;
        else if (rpmRatio < 0.6) torqueFactor = 1.0;
        else if (rpmRatio < 0.85) torqueFactor = 1.2;
        else torqueFactor = 0.8;

        // ===== ACCELERATION (FIXED) =====
        let accel = (car.hp / car.weight) * 140;
        accel *= torqueFactor * gearRatio;

        // ===== GRIP =====
        let gripLimit = 5 + (car.spd * 0.05);

        if (accel > gripLimit) {
            car.wheelspin = true;
            accel = gripLimit * 0.7;
            car.spd *= 0.995;
        } else {
            car.wheelspin = false;
        }

        // ===== DRAG =====
        let drag = car.spd * car.spd * 0.02;

        let totalAccel = accel - drag;
        totalAccel = Math.max(-5, Math.min(totalAccel, 12));

        // ===== APPLY =====
        car.spd += totalAccel * dt;

        if (car.spd > car.topSpeed) car.spd = car.topSpeed;
        if (car.spd < 0) car.spd = 0;

        car.pos += car.spd * dt;

        // ===== SHIFT TIMER =====
        if (car.shiftTimer > 0) {
            car.shiftTimer -= dt;
        }
    }
};