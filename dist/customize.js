import { SaveSystem } from "./save.js";
import { Decals } from "./decals.js";
function recordSpent(game, amount) {
    if (game === null || game === void 0 ? void 0 : game.recordMoneySpent) {
        game.recordMoneySpent(amount);
    }
}
export const Customize = {
    needlePrice: 25,
    hubPrice: 25,
    textPrice: 25,
    rimPrice: 150,
    paintPrice: 75,
    underglowPrice: 125,
    decalPrice: Decals.decalPrice,
    buyRimStyle(game, style) {
        if (game.money < this.rimPrice) {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
            return;
        }
        game.money -= this.rimPrice;
        recordSpent(game, this.rimPrice);
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
        recordSpent(game, this.needlePrice);
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
        recordSpent(game, this.hubPrice);
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
        recordSpent(game, this.textPrice);
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
        recordSpent(game, this.paintPrice);
        game.playerCar.paintColor = color;
        SaveSystem.save(game);
        game.raceMessage = "Car paint changed!";
        game.raceMessageTimer = 2;
    },
    buyDecal(game, decalId, color = "#ffffff") {
        var _a;
        if (!game.playerCar)
            return;
        const decal = Decals.get(decalId);
        if (decal.id === "none") {
            game.playerCar.decalId = "none";
            SaveSystem.save(game);
            game.raceMessage = "Decal removed!";
            game.raceMessageTimer = 2;
            return;
        }
        const price = (_a = decal.price) !== null && _a !== void 0 ? _a : this.decalPrice;
        if (game.money < price) {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
            return;
        }
        game.money -= price;
        recordSpent(game, price);
        game.playerCar.decalId = decal.id;
        game.playerCar.decalColor = decal.colorable ? color : "#ffffff";
        SaveSystem.save(game);
        game.raceMessage = "Decal applied!";
        game.raceMessageTimer = 2;
    },
    buyUnderglowColor(game, color) {
        if (!game.playerCar)
            return;
        if (game.money < this.underglowPrice) {
            game.raceMessage = "Not enough money!";
            game.raceMessageTimer = 2;
            return;
        }
        game.money -= this.underglowPrice;
        recordSpent(game, this.underglowPrice);
        game.playerCar.underglowColor = color;
        SaveSystem.save(game);
        game.raceMessage = "Neon underglow changed!";
        game.raceMessageTimer = 2;
    }
};
