export function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}
export function getCurveMultiplier(curve, rpmRatio) {
    const fallbackCurve = [
        [0, 0.55],
        [0.3, 0.82],
        [0.55, 1.0],
        [0.75, 0.96],
        [1, 0.72]
    ];
    const points = curve && curve.length >= 2
        ? curve
        : fallbackCurve;
    const ratio = clamp(rpmRatio, 0, 1);
    if (ratio <= points[0][0]) {
        return points[0][1];
    }
    for (let i = 1; i < points.length; i++) {
        const previous = points[i - 1];
        const next = points[i];
        if (ratio <= next[0]) {
            const range = Math.max(next[0] - previous[0], 0.001);
            const progress = (ratio - previous[0]) / range;
            return previous[1] + ((next[1] - previous[1]) * progress);
        }
    }
    return points[points.length - 1][1];
}
export function getDisplacementTorqueCurve(curve, level) {
    const points = curve && curve.length >= 2
        ? curve
        : [
            [0, 0.55],
            [0.3, 0.82],
            [0.55, 1.0],
            [0.75, 0.96],
            [1, 0.72]
        ];
    const strength = clamp(level, 0, 6);
    return points.map((point) => {
        const rpmRatio = point[0];
        let lift = 0.012 * strength;
        if (rpmRatio < 0.35) {
            lift = 0.075 * strength;
        }
        else if (rpmRatio < 0.72) {
            lift = 0.055 * strength;
        }
        else if (rpmRatio < 0.9) {
            lift = 0.03 * strength;
        }
        return [
            rpmRatio,
            clamp(point[1] + lift, 0.35, 1.28)
        ];
    });
}
export function getEstimatedBoostPsi(car, rpmRatio) {
    const inductionType = (car === null || car === void 0 ? void 0 : car.forcedInductionType) || "none";
    if (inductionType !== "turbo" && inductionType !== "supercharger") {
        return 0;
    }
    const level = inductionType === "turbo"
        ? Math.max(car.turboLevel || 1, 1)
        : Math.max(car.superchargerLevel || 1, 1);
    const maxBoostPsi = inductionType === "turbo"
        ? 5.5 + level * 2.25
        : 3.25 + level * 1.35;
    const rpmBoostFactor = inductionType === "turbo"
        ? clamp((rpmRatio - 0.38) / 0.44, 0, 1)
        : clamp((rpmRatio - 0.12) / 0.76, 0, 1);
    const boostShape = inductionType === "turbo"
        ? Math.pow(rpmBoostFactor, 1.45)
        : 0.34 + Math.pow(rpmBoostFactor, 0.72) * 0.66;
    return maxBoostPsi * boostShape;
}
export function getBoostTorqueMultiplier(car, boostPsi, rpmRatio) {
    const inductionType = (car === null || car === void 0 ? void 0 : car.forcedInductionType) || "none";
    if (inductionType !== "turbo" && inductionType !== "supercharger") {
        return 1;
    }
    const efficiency = inductionType === "turbo"
        ? 0.039 + clamp((rpmRatio - 0.48) / 0.42, 0, 1) * 0.033
        : 0.047 - clamp((rpmRatio - 0.72) / 0.28, 0, 1) * 0.007;
    return 1 + boostPsi * efficiency;
}
export function getEstimatedPowerAtRpm(car, rpm) {
    const maxRPM = Math.max((car === null || car === void 0 ? void 0 : car.maxRPM) || 7000, 1000);
    const rpmRatio = clamp(rpm / maxRPM, 0, 1);
    const curveMultiplier = getCurveMultiplier(car === null || car === void 0 ? void 0 : car.torqueCurve, rpmRatio);
    const boostPsi = getEstimatedBoostPsi(car, rpmRatio);
    const liveTorque = Math.max(1, ((car === null || car === void 0 ? void 0 : car.torque) || 1) *
        curveMultiplier *
        getBoostTorqueMultiplier(car, boostPsi, rpmRatio));
    const liveHorsepower = liveTorque * Math.max(rpm, 1000) / 5252;
    const highRpmPowerAccess = clamp((rpmRatio - 0.32) / 0.5, 0, 1);
    return ((liveHorsepower * 0.72) +
        (((car === null || car === void 0 ? void 0 : car.hp) || 1) * highRpmPowerAccess * 0.28));
}
export function getShiftWindow(car, gear) {
    const maxRPM = Math.max((car === null || car === void 0 ? void 0 : car.maxRPM) || 7000, 1000);
    const minShiftRPM = Math.max(1000, maxRPM * 0.24);
    const currentGear = Math.max(1, gear || (car === null || car === void 0 ? void 0 : car.gear) || 1);
    const ratios = (car === null || car === void 0 ? void 0 : car.gearRatios) || [];
    const oldRatio = ratios[currentGear - 1] || ratios[0] || 1;
    const newRatio = ratios[currentGear] || oldRatio;
    let peakRPM = minShiftRPM;
    let peakPower = 0;
    let bestShiftRPM = maxRPM * 0.96;
    for (let rpm = minShiftRPM; rpm <= maxRPM; rpm += 50) {
        const power = getEstimatedPowerAtRpm(car, rpm);
        if (power > peakPower) {
            peakPower = power;
            peakRPM = rpm;
        }
    }
    if (currentGear < ratios.length) {
        for (let rpm = Math.max(peakRPM, maxRPM * 0.5); rpm <= maxRPM; rpm += 50) {
            const nextGearRPM = clamp(rpm * (newRatio / oldRatio), 1000, maxRPM);
            const currentPower = getEstimatedPowerAtRpm(car, rpm);
            const nextGearPower = getEstimatedPowerAtRpm(car, nextGearRPM);
            if (nextGearPower >= currentPower * 0.985) {
                bestShiftRPM = rpm;
                break;
            }
        }
    }
    const perfectEnd = clamp(bestShiftRPM, minShiftRPM + 400, maxRPM * 0.99);
    const perfectStart = clamp(perfectEnd - maxRPM * 0.055, minShiftRPM, perfectEnd - 100);
    let goodStart = minShiftRPM;
    for (let rpm = minShiftRPM; rpm <= perfectStart; rpm += 50) {
        if (getEstimatedPowerAtRpm(car, rpm) >= peakPower * 0.82) {
            goodStart = rpm;
            break;
        }
    }
    return {
        goodStart,
        perfectStart,
        perfectEnd,
        peakRPM,
        recommendedShiftRPM: perfectEnd
    };
}
export function getShiftQuality(car, rpm, gear) {
    const window = getShiftWindow(car, gear);
    if (rpm < window.goodStart)
        return "EARLY";
    if (rpm < window.perfectStart)
        return "GOOD";
    if (rpm <= window.perfectEnd)
        return "PERFECT";
    return "LATE";
}
