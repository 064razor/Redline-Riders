import { SaveSystem } from "./save.js";
import { refreshDrivetrain } from "./garage.js";
export const Shop = {
    buyTires(game) {
        if (game.money >= game.playerCar.tirePrice) {
            game.money -= game.playerCar.tirePrice;
            game.playerCar.grip += 1;
            game.playerCar.tireLevel++;
            game.playerCar.tirePrice += 150;
            SaveSystem.save(game);
            game.raceMessage = "Tires upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyEngine(game) {
        const car = game.playerCar;
        if (game.money >= car.enginePrice) {
            game.money -= car.enginePrice;
            car.hp += 25;
            car.engineLevel++;
            car.enginePrice += 2200;
            SaveSystem.save(game);
            game.raceMessage = "Engine upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyPistons(game) {
        const car = game.playerCar;
        if (game.money >= car.pistonPrice) {
            game.money -= car.pistonPrice;
            car.hp += 10;
            car.torque += 6;
            car.pistonLevel++;
            car.pistonPrice =
                Math.floor(car.pistonPrice * 1.45);
            refreshDrivetrain(car);
            SaveSystem.save(game);
            game.raceMessage =
                "Pistons upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage =
                "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyCrank(game) {
        const car = game.playerCar;
        if (game.money >= car.crankPrice) {
            game.money -= car.crankPrice;
            car.hp += 6;
            car.torque += 12;
            car.crankLevel++;
            car.crankPrice =
                Math.floor(car.crankPrice * 1.5);
            refreshDrivetrain(car);
            SaveSystem.save(game);
            game.raceMessage =
                "Crank upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage =
                "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyIntake(game) {
        const car = game.playerCar;
        if (game.money >= car.intakePrice) {
            game.money -= car.intakePrice;
            car.hp += 4;
            car.torque += 3;
            car.powerbandMax += 35;
            car.intakeLevel++;
            car.intakePrice =
                Math.floor(car.intakePrice * 1.4);
            refreshDrivetrain(car);
            SaveSystem.save(game);
            game.raceMessage =
                "Intake upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage =
                "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyTopEnd(game) {
        const car = game.playerCar;
        if (game.money >= car.topEndPrice) {
            game.money -= car.topEndPrice;
            car.hp += 8;
            car.maxRPM += 75;
            car.powerbandMax += 75;
            car.topEndLevel++;
            car.topEndPrice =
                Math.floor(car.topEndPrice * 1.55);
            refreshDrivetrain(car);
            SaveSystem.save(game);
            game.raceMessage =
                "Top end upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage =
                "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyBottomEnd(game) {
        const car = game.playerCar;
        if (game.money >= car.bottomEndPrice) {
            game.money -= car.bottomEndPrice;
            car.hp += 13;
            car.torque += 10;
            car.bottomEndLevel++;
            car.bottomEndPrice =
                Math.floor(car.bottomEndPrice * 1.6);
            refreshDrivetrain(car);
            SaveSystem.save(game);
            game.raceMessage =
                "Bottom end upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage =
                "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyTransmission(game) {
        if (game.money >= game.playerCar.transmissionPrice) {
            game.money -= game.playerCar.transmissionPrice;
            game.playerCar.topSpeed += 10;
            const lastGear = game.playerCar.gearMaxSpeeds.length - 1;
            game.playerCar.gearMaxSpeeds[lastGear] += 10;
            game.playerCar.transmissionLevel++;
            game.playerCar.transmissionPrice += 350;
            SaveSystem.save(game);
            game.raceMessage = "Transmission upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyExhaust(game) {
        const car = game.playerCar;
        if (game.money >= car.exhaustPrice) {
            game.money -= car.exhaustPrice;
            car.hp += 8;
            car.exhaustLevel++;
            car.exhaustPrice += 120;
            SaveSystem.save(game);
            game.raceMessage = "Exhaust upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyECU(game) {
        const car = game.playerCar;
        if (game.money >= car.ecuPrice) {
            game.money -= car.ecuPrice;
            car.hp += 3;
            car.maxRPM += 35;
            car.powerbandMax += 55;
            // Move the whole powerband upward, but not as much as max RPM.
            // This makes the extra RPM useful without making the shift zone too easy.
            car.powerbandMin += 25;
            car.powerbandMax += 45;
            // Safety cap: powerband should never pass the new redline.
            if (car.powerbandMax > car.maxRPM - 35) {
                car.powerbandMax = car.maxRPM - 45;
            }
            // Safety cap: minimum should stay below maximum.
            if (car.powerbandMin > car.powerbandMax - 900) {
                car.powerbandMin = car.powerbandMax - 900;
            }
            car.ecuLevel++;
            refreshDrivetrain(car);
            car.ecuPrice += 135;
            SaveSystem.save(game);
            game.raceMessage = "ECU upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyWeightReduction(game) {
        var _a;
        const car = game.playerCar;
        if (game.money >= car.weightReductionPrice) {
            game.money -= car.weightReductionPrice;
            const baseWeight = (_a = car.baseWeight) !== null && _a !== void 0 ? _a : car.weight;
            car.baseWeight = baseWeight;
            const minimumWeightByPercent = baseWeight * 0.55;
            const absoluteMinimumWeight = 1200;
            const minimumAllowedWeight = Math.max(absoluteMinimumWeight, minimumWeightByPercent);
            car.weight -= 120;
            if (car.weight < minimumAllowedWeight) {
                car.weight = minimumAllowedWeight;
            }
            car.weightReductionLevel++;
            car.weightReductionPrice += 220;
            SaveSystem.save(game);
            game.raceMessage = "Weight reduced!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buySuspension(game) {
        const car = game.playerCar;
        if (game.money >= car.suspensionPrice) {
            game.money -= car.suspensionPrice;
            car.grip += 0.08;
            car.suspensionLevel++;
            car.suspensionPrice += 170;
            SaveSystem.save(game);
            game.raceMessage = "Suspension upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
        }
    },
    buyFlywheel(game) {
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
            SaveSystem.save(game);
            game.raceMessage = "Flywheel upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
        }
    }
};
