import { SaveSystem } from "./save.js";
import { Dealer } from "./dealer.js";
import { Game } from "./game.js";
import { Menu } from "./menu.js";
import { Input } from "./input.js";
import { Garage } from "./garage.js";
import { UI } from "./ui.js";
import { Shop } from "./shop.js";
import { Options } from "./options.js";
import { Customize } from "./customize.js";
function syncShopUI() {
    const tireBtn = document.getElementById("buyTires");
    const engineBtn = document.getElementById("buyEngine");
    const transmissionBtn = document.getElementById("buyTransmission");
    const exhaustBtn = document.getElementById("buyExhaust");
    const ecuBtn = document.getElementById("buyECU");
    const weightReductionBtn = document.getElementById("buyWeightReduction");
    const suspensionBtn = document.getElementById("buySuspension");
    const flywheelBtn = document.getElementById("buyFlywheel");
    const dealerBtn = document.getElementById("dealerBtn");
    const dealerPanel = document.getElementById("dealerPanel");
    const needleBtn = document.getElementById("buyNeedleColor");
    const hubBtn = document.getElementById("buyHubColor");
    const textBtn = document.getElementById("buyTextColor");
    const paintBtn = document.getElementById("buyPaintColor");
    paintBtn.innerText = `Paint Car ($${Customize.paintPrice})`;
    tireBtn.innerText = `Buy Tires (+1 Grip) ($${Game.playerCar.tirePrice})`;
    engineBtn.innerText = `Buy Engine (+25 HP) ($${Game.playerCar.enginePrice})`;
    transmissionBtn.innerText = `Transmission Upgrade (+Top Speed) ($${Game.playerCar.transmissionPrice})`;
    exhaustBtn.innerText = `Buy Exhaust (+8 HP) ($${Game.playerCar.exhaustPrice})`;
    ecuBtn.innerText = `Buy ECU (+5 HP / +150 RPM) ($${Game.playerCar.ecuPrice})`;
    weightReductionBtn.innerText = `Weight Reduction (-120 lbs) ($${Game.playerCar.weightReductionPrice})`;
    suspensionBtn.innerText = `Suspension (+0.08 Grip) ($${Game.playerCar.suspensionPrice})`;
    flywheelBtn.innerText = `Flywheel (-Shift Time) ($${Game.playerCar.flywheelPrice})`;
    needleBtn.innerText = `Change ($${Customize.needlePrice})`;
    hubBtn.innerText = `Change ($${Customize.hubPrice})`;
    textBtn.innerText = `Change ($${Customize.textPrice})`;
}
function syncDealerUI() {
    const listings = document.getElementById("dealerListings");
    if (!listings)
        return;
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
const dealerBtn = document.getElementById("dealerBtn");
const dealerPanel = document.getElementById("dealerPanel");
const saveBtn = document.getElementById("saveBtn");
const saveSlotSelect = document.getElementById("saveSlotSelect");
const loadSlotBtn = document.getElementById("loadSlotBtn");
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
document.getElementById("startBtn").onclick = () => {
    Game.start();
};
if (!Game.playerCar) {
    Game.playerCar = Garage.getStarter();
}
syncShopUI();
document.getElementById("buyTires")
    .onclick = () => {
    Shop.buyTires(Game);
    syncShopUI();
};
document.getElementById("buyEngine")
    .onclick = () => {
    Shop.buyEngine(Game);
    syncShopUI();
};
document.getElementById("buyTransmission")
    .onclick = () => {
    Shop.buyTransmission(Game);
    syncShopUI();
};
document.getElementById("buyExhaust")
    .onclick = () => {
    Shop.buyExhaust(Game);
    syncShopUI();
};
document.getElementById("buyECU")
    .onclick = () => {
    Shop.buyECU(Game);
    syncShopUI();
};
document.getElementById("buyWeightReduction")
    .onclick = () => {
    Shop.buyWeightReduction(Game);
    syncShopUI();
};
document.getElementById("buySuspension")
    .onclick = () => {
    Shop.buySuspension(Game);
    syncShopUI();
};
document.getElementById("buyFlywheel")
    .onclick = () => {
    Shop.buyFlywheel(Game);
    syncShopUI();
};
const rimBtn = document.getElementById("buyRimStyle");
rimBtn.innerText =
    "Buy Rims ($" + Customize.rimPrice + ")";
rimBtn.onclick = () => {
    const selector = document.getElementById("rimStyleSelect");
    Customize.buyRimStyle(Game, selector.value);
    syncShopUI();
};
document.getElementById("unitSelect")
    .onchange = (e) => {
    const target = e.target;
    Options.speedUnit = target.value;
};
document.getElementById("laneSelect")
    .onchange = (e) => {
    const target = e.target;
    Options.lane = target.value;
};
document.getElementById("directionSelect")
    .onchange = (e) => {
    const target = e.target;
    Options.raceDirection = target.value;
};
document.getElementById("buyPaintColor")
    .onclick = () => {
    const picker = document.getElementById("paintColorPicker");
    Customize.buyPaintColor(Game, picker.value);
    syncShopUI();
};
document.getElementById("buyNeedleColor")
    .onclick = () => {
    const picker = document.getElementById("needleColorPicker");
    Customize.buyNeedleColor(Game, picker.value);
    syncShopUI();
};
document.getElementById("buyHubColor")
    .onclick = () => {
    const picker = document.getElementById("hubColorPicker");
    Customize.buyHubColor(Game, picker.value);
    syncShopUI();
};
document.getElementById("buyTextColor")
    .onclick = () => {
    const picker = document.getElementById("textColorPicker");
    Customize.buyTextColor(Game, picker.value);
    syncShopUI();
};
function makeBar(label, value, max, suffix = "") {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    return `
        <div style="margin: 8px 0;">
            <div style="display:flex; justify-content:space-between;">
                <span>${label}</span>
                <span>${value}${suffix}</span>
            </div>
            <div style="height:10px; background:#222; border:1px solid #444;">
                <div style="
                    height:100%;
                    width:${percent}%;
                    background:linear-gradient(90deg, #33ff33, #ffff33, #ff3333);
                "></div>
            </div>
        </div>
    `;
}
function syncGarageUI() {
    const garageInfo = document.getElementById("garageInfo");
    if (!garageInfo || !Game.playerCar)
        return;
    const car = Game.playerCar;
    garageInfo.innerHTML = `
        <div><b>${car.name}</b></div>
        <div style="margin-bottom:10px;">Current selected car</div>

        ${makeBar("Horsepower", car.hp, 800, " HP")}
        ${makeBar("Grip", Number(car.grip.toFixed(2)), 3)}
        ${makeBar("Weight", car.weight, 5000, " lbs")}
        ${makeBar("Top Speed", car.topSpeed, 250, " MPH")}
        ${makeBar("Max RPM", car.maxRPM, 10000, " RPM")}
        ${makeBar("Shift Speed", Number(car.shiftSpeed.toFixed(2)), 1, "s")}
    `;
}
const customizeBtn = document.getElementById("customizeBtn");
const customizePanel = document.getElementById("customizePanel");
const save = SaveSystem.load();
// TEMP bridge so your HTML button still works
window.Game = Game;
window.syncGarageUI = syncGarageUI;
// Initialize systems
Menu.init();
syncShopUI();
syncDealerUI();
Input.init(Game);
UI.init();
