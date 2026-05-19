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
            price: 1400,
            displayName: Bodywork.cars.swagGG2.displayName,
            description: "Lightweight, zippy hatchback with quick response."
        },
        {
            bodyId: "swagLadybug2024",
            price: 950,
            displayName: Bodywork.cars.swagLadybug2024.displayName,
            description: "Soft, friendly compact hatch. A humble alternate starter candidate."
        },
        {
            bodyId: "scholarVibratio",
            price: 2250,
            displayName: Bodywork.cars.scholarVibratio.displayName,
            description: "AWD launch specialist. Confident off the line, practical everywhere else."
        },
        {
            bodyId: "rouletteBlair",
            price: 2100,
            displayName: Bodywork.cars.rouletteBlair.displayName,
            description: "Heavy, but powerful. Built for the drag strip."
        },	
		{
			bodyId: "rouletteMontBlanc",
			name: "Roulette Mont Blanc",
			price: 2450,
			displayName: Bodywork.cars.rouletteMontBlanc.displayName,
			description: "Muscular in-betweener. Stern, but fair"
		},
		
		{
			bodyId: "hannaCivilian",
			price: 1850,
			displayName: Bodywork.cars.hannaCivilian.displayName,
			description: "Underpowerd but high-revving coupe. Ready and reliable."
		},
    ],

    selectedBodyId: "maruMk5",

    ownsCar(bodyId: string) {
        return Game.ownedCars.indexOf(bodyId) !== -1;
    },

    createCar(bodyId: string) {
        if (bodyId === "maruMk5") {
            return Garage.getMaruMk5();
        }

        if (bodyId === "swagGG2") {
            return Garage.getSwagGG2();
        }

        if (bodyId === "swagLadybug2024") {
            return Garage.getSwagLadybug2024();
        }

        if (bodyId === "scholarVibratio") {
            return Garage.getScholarVibratio();
        }

        if (bodyId === "rouletteBlair") {
            return Garage.getRouletteBlair();
        }
		
		if (bodyId === "rouletteMontBlanc") {
             return Garage.getRouletteMontBlanc();
        }
		
		if (bodyId === "hannaCivilian") {
			return Garage.getHannaCivilian();
		}



        return null;
    },

    buyCar(game: any, bodyId: string) {
        const listing =
            this.carsForSale.find(car => car.bodyId === bodyId);

        if (!listing) return;

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

        const newCar = this.createCar(bodyId);

        if (!newCar) {
            game.raceMessage = "Car data missing!";
            game.raceMessageTimer = 2;
            return;
        }

        game.money -= listing.price;
        if (game.recordMoneySpent) {
            game.recordMoneySpent(listing.price);
        }

        game.ownedCars.push(bodyId);
        game.garageCars[bodyId] = newCar;

        SaveSystem.save(game);

        game.raceMessage = `${listing.displayName} purchased!`;
        game.raceMessageTimer = 2;
    },

    selectCar(game: any, bodyId: string) {
        if (!this.ownsCar(bodyId)) {
            game.raceMessage = "You do not own this car!";
            game.raceMessageTimer = 2;
            return;
        }

        if (!game.garageCars[bodyId]) {
            const newCar = this.createCar(bodyId);

            if (!newCar) {
                game.raceMessage = "Car data missing!";
                game.raceMessageTimer = 2;
                return;
            }

            game.garageCars[bodyId] = newCar;
        }

        game.playerCar = game.garageCars[bodyId];

        game.raceMessage =
            game.playerCar.name + " selected!";

        game.raceMessageTimer = 2;

        SaveSystem.save(game);
    }
};
