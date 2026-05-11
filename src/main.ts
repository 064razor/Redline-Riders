import { SaveSystem } from "./save.js";
import { Dealer } from "./dealer.js";
import { Game } from "./game.js";
import { Input } from "./input.js";
import { Garage } from "./garage.js";
import { UI } from "./ui.js";
import { Shop } from "./shop.js";
import { Options } from "./options.js";
import { Customize } from "./customize.js";

function syncShopUI() {
    const tireBtn = document.getElementById("buyTires") as HTMLButtonElement;
    const engineBtn = document.getElementById("buyEngine") as HTMLButtonElement;
    const transmissionBtn = document.getElementById("buyTransmission") as HTMLButtonElement;
    const dealerBtn = document.getElementById("dealerBtn") as HTMLButtonElement;
    const dealerPanel = document.getElementById("dealerPanel") as HTMLDivElement;
    const needleBtn = document.getElementById("buyNeedleColor") as HTMLButtonElement;
    const hubBtn = document.getElementById("buyHubColor") as HTMLButtonElement;
    const textBtn = document.getElementById("buyTextColor") as HTMLButtonElement;
	const paintBtn = document.getElementById("buyPaintColor") as HTMLButtonElement;

    paintBtn.innerText = `Paint Car ($${Customize.paintPrice})`;

    tireBtn.innerText = `Buy Tires (+1 Grip) ($${Game.playerCar.tirePrice})`;
    engineBtn.innerText = `Buy Engine (+25 HP) ($${Game.playerCar.enginePrice})`;
    transmissionBtn.innerText = `Transmission Upgrade (+Top Speed) ($${Game.playerCar.transmissionPrice})`;

    needleBtn.innerText = `Change ($${Customize.needlePrice})`;
    hubBtn.innerText = `Change ($${Customize.hubPrice})`;
    textBtn.innerText = `Change ($${Customize.textPrice})`;
}

function syncDealerUI() {
    const listings = document.getElementById("dealerListings") as HTMLDivElement;
    if (!listings) return;

    listings.innerHTML = "";

    for (const car of Dealer.carsForSale) {
        const owned = Dealer.ownsCar(car.bodyId);

        const row = document.createElement("div");
        row.style.border = "1px solid #333";
        row.style.padding = "8px";
        row.style.marginBottom = "8px";

        row.innerHTML = `
            <div><b>${car.displayName}</b></div>
            <div>${car.description}</div>
            <div>Price: ${car.price === 0 ? "Owned" : "$" + car.price}</div>
        `;

        const button = document.createElement("button");

        if (owned) {
            button.innerText = "Select";
            button.onclick = () => {
                Dealer.selectCar(Game, car.bodyId);
                syncDealerUI();
            };
        }
        else {
            button.innerText = `Buy ($${car.price})`;
            button.onclick = () => {
                Dealer.buyCar(Game, car.bodyId);
                syncDealerUI();
            };
        }

        row.appendChild(button);
        listings.appendChild(row);
    }
}

const dealerBtn = document.getElementById("dealerBtn") as HTMLButtonElement;
const dealerPanel = document.getElementById("dealerPanel") as HTMLDivElement;

const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
const saveSlotSelect = document.getElementById("saveSlotSelect") as HTMLSelectElement;
const loadSlotBtn = document.getElementById("loadSlotBtn") as HTMLButtonElement;

saveBtn.onclick = () => {
    const slot = Number(saveSlotSelect.value);

    SaveSystem.save(Game, slot);

    Game.raceMessage = "Game saved to Slot " + slot + "!";
    Game.raceMessageTimer = 2;
};

loadSlotBtn.onclick = () => {
    const slot = Number(saveSlotSelect.value);

    const save = SaveSystem.load(slot);

    if (!save) {
        Game.raceMessage = "No save found in Slot " + slot + ".";
        Game.raceMessageTimer = 2;
        return;
    }

    Game.money = save.money;
    Game.ownedCars = save.ownedCars;
    Game.garageCars = save.garageCars;
    Game.playerCar =
        Game.garageCars[save.selectedCarId] ||
        Game.garageCars.maruMk5;

    syncShopUI();
    syncDealerUI();

    Game.raceMessage = "Loaded Slot " + slot + "!";
    Game.raceMessageTimer = 2;
};

dealerBtn.onclick = () => {
    dealerPanel.style.display =
        dealerPanel.style.display === "none" ? "block" : "none";

    syncDealerUI();
};

document.getElementById("startBtn")!.onclick = () => {
    Game.start();
};

if (!Game.playerCar) {
    Game.playerCar = Garage.getStarter();
}

syncShopUI();

(document.getElementById("buyTires") as HTMLButtonElement)
.onclick = () => {
    Shop.buyTires(Game);
    syncShopUI();
};

(document.getElementById("buyEngine") as HTMLButtonElement)
.onclick = () => {
    Shop.buyEngine(Game);
    syncShopUI();
};

(document.getElementById("buyTransmission") as HTMLButtonElement)
.onclick = () => {
    Shop.buyTransmission(Game);
    syncShopUI();
};

(document.getElementById("optionsBtn") as HTMLButtonElement)
.onclick = () => {
	


    const panel =
        document.getElementById("optionsPanel")!;

    if (panel.style.display === "none") {

        panel.style.display = "block";
    }
    else {

        panel.style.display = "none";
    }
};

const rimBtn =
    document.getElementById("buyRimStyle") as HTMLButtonElement;

rimBtn.innerText =
    "Buy Rims ($" + Customize.rimPrice + ")";

rimBtn.onclick = () => {
    const selector =
        document.getElementById("rimStyleSelect") as HTMLSelectElement;

    Customize.buyRimStyle(Game, selector.value);
    syncShopUI();
};

(document.getElementById("unitSelect") as HTMLSelectElement)
.onchange = (e) => {

    const target = e.target as HTMLSelectElement;

    Options.speedUnit = target.value;
};

(document.getElementById("laneSelect") as HTMLSelectElement)
.onchange = (e) => {

    const target = e.target as HTMLSelectElement;

    Options.lane = target.value;
};

(document.getElementById("directionSelect") as HTMLSelectElement)
.onchange = (e) => {

    const target = e.target as HTMLSelectElement;

    Options.raceDirection = target.value;
};

(document.getElementById("buyPaintColor") as HTMLButtonElement)
.onclick = () => {
    const picker =
        document.getElementById("paintColorPicker") as HTMLInputElement;

    Customize.buyPaintColor(Game, picker.value);
    syncShopUI();
};

(document.getElementById("buyNeedleColor") as HTMLButtonElement)
.onclick = () => {
    const picker =
        document.getElementById("needleColorPicker") as HTMLInputElement;

    Customize.buyNeedleColor(Game, picker.value);
    syncShopUI();
};

(document.getElementById("buyHubColor") as HTMLButtonElement)
.onclick = () => {
    const picker =
        document.getElementById("hubColorPicker") as HTMLInputElement;

    Customize.buyHubColor(Game, picker.value);
    syncShopUI();
};


(document.getElementById("buyTextColor") as HTMLButtonElement)
.onclick = () => {
    const picker =
        document.getElementById("textColorPicker") as HTMLInputElement;

    Customize.buyTextColor(Game, picker.value);
    syncShopUI();
};

const customizeBtn = document.getElementById("customizeBtn") as HTMLButtonElement;
const customizePanel = document.getElementById("customizePanel") as HTMLDivElement;

customizeBtn.onclick = () => {
    customizePanel.style.display =
        customizePanel.style.display === "none" ? "block" : "none";
};

const save = SaveSystem.load();

// TEMP bridge so your HTML button still works
(window as any).Game = Game;

// Initialize systems
syncShopUI();
syncDealerUI();
Input.init(Game);
UI.init();

