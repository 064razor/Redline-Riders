import { SaveSystem } from "./save.js";
import { getDefaultTorqueCurve } from "./garage.js";
import { getDisplacementTorqueCurve } from "./power.js";

function syncGarageCar(game: any) {
    if (!game || !game.playerCar || !game.garageCars) return;

    game.garageCars[game.playerCar.bodyId] =
        game.playerCar;
}

function finishPurchase(game: any, message: string) {
    syncGarageCar(game);
    SaveSystem.save(game);

    game.raceMessage = message;
    game.raceMessageTimer = 2;
}

function formatDelta(label: string, amount: number, suffix = "") {
    const sign =
        amount > 0 ? "+" : "";

    return label + " " + sign + amount + suffix;
}

function finishUpgrade(game: any, name: string, deltas: string[]) {
    finishPurchase(
        game,
        name + ": " + deltas.join(", ")
    );
}

function hasDifferentPowerAdder(car: any, type: string) {
    const current = car.forcedInductionType || "none";

    return current !== "none" && current !== type;
}

function getPowerAdderName(type: string) {
    if (type === "turbo") return "turbo";
    if (type === "supercharger") return "supercharger";
    if (type === "displacement") return "displacement upgrade";

    return "power adder";
}

function incompatiblePowerAdder(game: any, requestedType: string) {
    const currentType =
        game.playerCar?.forcedInductionType || "none";

    game.raceMessage =
        "Cannot install " + getPowerAdderName(requestedType) +
        " with " + getPowerAdderName(currentType) +
        ". Fully uninstall the incompatible upgrades first.";

    game.raceMessageTimer = 4;
}

function applyDisplacementCurve(car: any) {
    const baseCurve =
        car.baseTorqueCurve ||
        getDefaultTorqueCurve(car.bodyId);

    car.baseTorqueCurve =
        baseCurve;

    car.torqueCurve =
        getDisplacementTorqueCurve(
            baseCurve,
            car.displacementLevel || 0
        );
}

function notEnoughMoney(game: any) {
    game.raceMessage = "Not enough money!";
    game.raceMessageTimer = 2;
}

export const Shop = {

    buyTires(game: any) {
        const car = game.playerCar;

        if (game.money >= car.tirePrice) {
            game.money -= car.tirePrice;

            car.grip += 120;
            car.tireLevel++;
            car.tirePrice += 150;

            finishUpgrade(game, "Tires upgraded", [
                formatDelta("Grip", 120)
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyEngine(game: any) {
        const car = game.playerCar;

        if (game.money >= car.enginePrice) {
            game.money -= car.enginePrice;

            car.hp += 25;
            car.engineLevel++;
            car.enginePrice += 200;

            finishUpgrade(game, "Engine upgraded", [
                formatDelta("HP", 25)
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyTransmission(game: any) {
        const car = game.playerCar;

        if (game.money >= car.transmissionPrice) {
            game.money -= car.transmissionPrice;

            car.topSpeed += 10;

            const lastGear =
                car.gearMaxSpeeds.length - 1;

            car.gearMaxSpeeds[lastGear] += 10;

            car.transmissionLevel++;
            car.transmissionPrice += 350;

            finishUpgrade(game, "Transmission upgraded", [
                formatDelta("Top speed", 10, " MPH")
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyExhaust(game: any) {
        const car = game.playerCar;

        if (game.money >= car.exhaustPrice) {
            game.money -= car.exhaustPrice;

            car.hp += 8;
            car.exhaustLevel++;
            car.exhaustPrice += 120;

            finishUpgrade(game, "Exhaust upgraded", [
                formatDelta("HP", 8)
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyECU(game: any) {
        const car = game.playerCar;

        if (game.money >= car.ecuPrice) {
            game.money -= car.ecuPrice;

            car.hp += 5;
            car.maxRPM += 55;
            car.powerbandMax += 55;

            car.ecuLevel++;
            car.ecuPrice += 160;

            finishUpgrade(game, "ECU upgraded", [
                formatDelta("HP", 5),
                formatDelta("Redline", 55, " RPM")
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },


    buyTurbo(game: any) {
        const car = game.playerCar;

        if (hasDifferentPowerAdder(car, "turbo")) {
            incompatiblePowerAdder(game, "turbo");
            return;
        }

        const price = car.turboPrice ?? 1800;

        if (game.money >= price) {
            game.money -= price;
            car.forcedInductionType = "turbo";
            car.turboLevel = (car.turboLevel || 0) + 1;
            car.turboPrice = price + 900;
            car.hp += 10;
            car.torque += 2;
            car.powerbandMax += 70;
            car.turboSpool = 0;
            finishUpgrade(game, "Turbo upgraded", [
                formatDelta("Peak boost", 2.25, " PSI"),
                formatDelta("HP", 10),
                formatDelta("Powerband", 70, " RPM")
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buySupercharger(game: any) {
        const car = game.playerCar;

        if (hasDifferentPowerAdder(car, "supercharger")) {
            incompatiblePowerAdder(game, "supercharger");
            return;
        }

        const price = car.superchargerPrice ?? 1700;

        if (game.money >= price) {
            game.money -= price;
            car.forcedInductionType = "supercharger";
            car.superchargerLevel = (car.superchargerLevel || 0) + 1;
            car.superchargerPrice = price + 850;
            car.hp += 5;
            car.torque += 10;
            car.powerbandMin =
                Math.max(1000, (car.powerbandMin || 3000) - 45);
            finishUpgrade(game, "Supercharger upgraded", [
                formatDelta("Peak boost", 1.35, " PSI"),
                formatDelta("HP", 5),
                formatDelta("Torque", 10),
                "Instant boost"
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyDisplacement(game: any) {
        const car = game.playerCar;

        if (hasDifferentPowerAdder(car, "displacement")) {
            incompatiblePowerAdder(game, "displacement");
            return;
        }

        const price = car.displacementPrice ?? 1450;

        if (game.money >= price) {
            game.money -= price;
            car.forcedInductionType = "displacement";
            car.displacementLevel = (car.displacementLevel || 0) + 1;
            car.displacementPrice = price + 720;
            car.hp += 10;
            car.torque += 18;
            car.powerbandMin =
                Math.max(1000, (car.powerbandMin || 3000) - 80);
            car.powerbandMax =
                Math.max(car.powerbandMin + 900, (car.powerbandMax || 5500) - 35);
            applyDisplacementCurve(car);
            finishUpgrade(game, "Displacement increased", [
                formatDelta("HP", 10),
                formatDelta("Torque", 18),
                "Broader NA curve"
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },
    buyWeightReduction(game: any) {
        const car = game.playerCar;

        if (game.money >= car.weightReductionPrice) {
            game.money -= car.weightReductionPrice;

            const baseWeight =
                car.baseWeight ?? car.weight;

            car.baseWeight = baseWeight;

            const minimumWeightByPercent =
                baseWeight * 0.55;

            const absoluteMinimumWeight =
                1200;

            const minimumAllowedWeight =
                Math.max(
                    absoluteMinimumWeight,
                    minimumWeightByPercent
                );

            car.weight -= 120;

            if (car.weight < minimumAllowedWeight) {
                car.weight = minimumAllowedWeight;
            }

            car.weightReductionLevel++;
            car.weightReductionPrice += 220;

            finishUpgrade(game, "Weight reduced", [
                formatDelta("Weight", -120, " lbs")
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buySuspension(game: any) {
        const car = game.playerCar;

        if (game.money >= car.suspensionPrice) {
            game.money -= car.suspensionPrice;

            car.grip += 10;
            car.suspensionLevel++;
            car.suspensionPrice += 170;

            finishUpgrade(game, "Suspension upgraded", [
                formatDelta("Grip", 10)
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyFlywheel(game: any) {
        const car = game.playerCar;

        if (car.shiftSpeed <= 0.12) {
            game.raceMessage = "Shift speed already maxed!";
            game.raceMessageTimer = 2;
            return;
        }

        if (game.money >= car.flywheelPrice) {
            game.money -= car.flywheelPrice;

            car.shiftSpeed -= 0.02;

            if (car.shiftSpeed < 0.12) {
                car.shiftSpeed = 0.12;
            }

            car.flywheelLevel++;
            car.flywheelPrice += 190;

            finishUpgrade(game, "Flywheel upgraded", [
                formatDelta("Shift time", -0.02, "s")
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyPistons(game: any) {
        const car = game.playerCar;

        if (game.money >= car.pistonPrice) {
            game.money -= car.pistonPrice;

            car.hp += 10;
            car.torque += 6;
            car.pistonLevel++;
            car.pistonPrice += 260;

            finishUpgrade(game, "Pistons upgraded", [
                formatDelta("HP", 10),
                formatDelta("Torque", 6)
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyCrank(game: any) {
        const car = game.playerCar;

        if (game.money >= car.crankPrice) {
            game.money -= car.crankPrice;

            car.hp += 6;
            car.torque += 12;
            car.crankLevel++;
            car.crankPrice += 280;

            finishUpgrade(game, "Crank upgraded", [
                formatDelta("HP", 6),
                formatDelta("Torque", 12)
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyIntake(game: any) {
        const car = game.playerCar;

        if (game.money >= car.intakePrice) {
            game.money -= car.intakePrice;

            car.hp += 7;
            car.torque += 4;
            car.intakeLevel++;
            car.intakePrice += 180;

            finishUpgrade(game, "Intake upgraded", [
                formatDelta("HP", 7),
                formatDelta("Torque", 4)
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyTopEnd(game: any) {
        const car = game.playerCar;

        if (game.money >= car.topEndPrice) {
            game.money -= car.topEndPrice;

            car.hp += 14;
            car.maxRPM += 90;
            car.powerbandMax += 90;
            car.topEndLevel++;
            car.topEndPrice += 320;

            finishUpgrade(game, "Top end upgraded", [
                formatDelta("HP", 14),
                formatDelta("Redline", 90, " RPM")
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    },

    buyBottomEnd(game: any) {
        const car = game.playerCar;

        if (game.money >= car.bottomEndPrice) {
            game.money -= car.bottomEndPrice;

            car.hp += 8;
            car.torque += 16;
            car.bottomEndLevel++;
            car.bottomEndPrice += 340;

            finishUpgrade(game, "Bottom end upgraded", [
                formatDelta("HP", 8),
                formatDelta("Torque", 16)
            ]);
        }
        else {
            notEnoughMoney(game);
        }
    }
};
