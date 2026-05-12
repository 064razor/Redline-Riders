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
            car.enginePrice += 200;
            SaveSystem.save(game);
            game.raceMessage = "Engine upgraded!";
            game.raceMessageTimer = 2;
        }
        else {
            game.raceMessage = "Not enough money!";
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
            car.hp += 5;
            car.maxRPM += 55;
            car.powerbandMax += 55;
            // Move the whole powerband upward, but not as much as max RPM.
            // This makes the extra RPM useful without making the shift zone too easy.
            car.powerbandMin += 125;
            car.powerbandMax += 145;
            // Safety cap: powerband should never pass the new redline.
            if (car.powerbandMax > car.maxRPM - 150) {
                car.powerbandMax = car.maxRPM - 150;
            }
            // Safety cap: minimum should stay below maximum.
            if (car.powerbandMin > car.powerbandMax - 900) {
                car.powerbandMin = car.powerbandMax - 900;
            }
            car.ecuLevel++;
            refreshDrivetrain(car);
            car.ecuPrice += 160;
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
