import { Game } from "./game.js";
import { SaveSystem } from "./save.js";
import { Bodywork } from "./bodywork.js";
import { Garage } from "./garage.js";
export const Dealer = {
    carsForSale: [
        {
            bodyId: "maruMk5",
            price: 0,
            displayName: Bodywork.cars.maruMk5.displayName,
            description: "Balanced lightweight roadster. Your first reliable racer."
        },
        {
            bodyId: "swagGG2",
            price: 450,
            displayName: Bodywork.cars.swagGG2.displayName,
            description: "Lightweight, zippy hatchback with quick response."
        }
    ],
    selectedBodyId: "maruMk5",
    ownsCar(bodyId) {
        return Game.ownedCars.indexOf(bodyId) !== -1;
    },
    buyCar(game, bodyId) {
        const listing = this.carsForSale.find(car => car.bodyId === bodyId);
        if (!listing)
            return;
        if (this.ownsCar(bodyId)) {
            game.raceMessage = "You already own this car!";
            game.raceMessageTimer = 2;
            return;
        }
        if (game.money < listing.price) {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
            return;
        }
        game.money -= listing.price;
        game.ownedCars.push(bodyId);
        if (bodyId === "maruMk5") {
            game.garageCars[bodyId] = Garage.getMaruMk5();
        }
        if (bodyId === "swagGG2") {
            game.garageCars[bodyId] = Garage.getSwagGG2();
        }
        SaveSystem.save(game);
        game.raceMessage = `${listing.displayName} purchased!`;
        game.raceMessageTimer = 2;
    },
    selectCar(game, bodyId) {
        if (!this.ownsCar(bodyId)) {
            game.raceMessage = "You do not own this car!";
            game.raceMessageTimer = 2;
            return;
        }
        game.playerCar = game.garageCars[bodyId];
        game.raceMessage =
            game.playerCar.name + " selected!";
        game.raceMessageTimer = 2;
        SaveSystem.save(game);
    }
};
