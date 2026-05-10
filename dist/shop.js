import { SaveSystem } from "./save.js";
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
    }
};
