export const Shop = {

    tireLevel: 0,
    engineLevel: 0,

    tirePrice: 200,
    enginePrice: 300,

    buyTires(game: any) {

        if (game.money >= this.tirePrice) {

            game.money -= this.tirePrice;

            game.playerCar.grip += 1;

            this.tireLevel++;

            this.tirePrice += 150;

            alert("Tires upgraded!");
        }
        else {
            alert("Not enough money!");
        }
    },

    buyEngine(game: any) {

        if (game.money >= this.enginePrice) {

            game.money -= this.enginePrice;

            game.playerCar.hp += 25;

            this.engineLevel++;

            this.enginePrice += 200;

            alert("Engine upgraded!");
        }
        else {
            alert("Not enough money!");
        }
    }
};