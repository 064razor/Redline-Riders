import { SaveSystem } from "./save.js";
export const Customize = {
    needlePrice: 25,
    hubPrice: 25,
    textPrice: 25,
    rimPrice: 150,
    paintPrice: 75,
    buyRimStyle(game, style) {
        if (game.money < this.rimPrice) {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
            return;
        }
        game.money -= this.rimPrice;
        game.playerCar.rimStyle = style;
        SaveSystem.save(game);
        game.raceMessage = "Rims changed!";
        game.raceMessageTimer = 2;
    },
    buyNeedleColor(game, color) {
        if (!game.playerCar)
            return;
        if (game.money < this.needlePrice) {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
            return;
        }
        game.money -= this.needlePrice;
        game.playerCar.needleColor = color;
        SaveSystem.save(game);
        game.raceMessage = "Needle color changed!";
        game.raceMessageTimer = 2;
    },
    buyHubColor(game, color) {
        if (!game.playerCar)
            return;
        if (game.money < this.hubPrice) {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
            return;
        }
        game.money -= this.hubPrice;
        game.playerCar.hubColor = color;
        SaveSystem.save(game);
        game.raceMessage = "Center circle color changed!";
        game.raceMessageTimer = 2;
    },
    buyTextColor(game, color) {
        if (!game.playerCar)
            return;
        if (game.money < this.textPrice) {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
            return;
        }
        game.money -= this.textPrice;
        game.playerCar.tachTextColor = color;
        SaveSystem.save(game);
        game.raceMessage = "MPH/Gear color changed!";
        game.raceMessageTimer = 2;
    },
    buyPaintColor(game, color) {
        if (!game.playerCar)
            return;
        if (game.money < this.paintPrice) {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
            return;
        }
        game.money -= this.paintPrice;
        game.playerCar.paintColor = color;
        SaveSystem.save(game);
        game.raceMessage = "Car paint changed!";
        game.raceMessageTimer = 2;
    }
};
