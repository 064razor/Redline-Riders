import { SaveSystem } from "./save.js";
import { Dealer } from "./dealer.js";
import { Game } from "./game.js";
import { Bodywork } from "./bodywork.js";
import { Menu } from "./menu.js";
import { Input } from "./input.js";
import { Garage, getEngineType, getDrivetrain, migrateGarageGripRatings, migrateGarageTorqueCurves, migrateGarageBalanceDefaults, migrateGaragePowerAdderCurves } from "./garage.js";
import { AudioSystem } from "./audio.js";
import { Render } from "./render.js";
import { Options } from "./options.js";
import { UI } from "./ui.js";
import { Shop } from "./shop.js";
import { Customize } from "./customize.js";
import { Decals } from "./decals.js";
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
                    background:linear-gradient(90deg, #c1e9ec, #88ccff, #3388ff);
                "></div>
            </div>
        </div>
    `;
}
function getPowerAdderDisplayName(car) {
    const type = (car === null || car === void 0 ? void 0 : car.forcedInductionType) || "none";
    if (type === "turbo")
        return "Turbo";
    if (type === "supercharger")
        return "Super";
    if (type === "displacement")
        return "NA+";
    return "NA";
}
function getGarageStatsMarkup(car) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const garageSpeed = Options.speedUnit === "KMH"
        ? Math.round(((_a = car.topSpeed) !== null && _a !== void 0 ? _a : 0) * 1.60934)
        : Math.round((_b = car.topSpeed) !== null && _b !== void 0 ? _b : 0);
    const garageSpeedSuffix = Options.speedUnit === "KMH"
        ? " KM/H"
        : " MPH";
    const garageWeight = Options.weightUnit === "KG"
        ? Math.round(((_c = car.weight) !== null && _c !== void 0 ? _c : 0) * 0.453592)
        : (_d = car.weight) !== null && _d !== void 0 ? _d : 0;
    const garageWeightSuffix = Options.weightUnit === "KG"
        ? " kg"
        : " lbs";
    const engineType = car.engineType || getEngineType(car.bodyId);
    const drivetrain = car.drivetrain || getDrivetrain(car.bodyId);
    return `
        <div><b>${car.name}</b></div>
        <div>Engine: ${engineType} | Drivetrain: ${drivetrain}</div>
        <div>HP: ${car.hp} | Grip: ${Math.round(car.grip)}</div>
        <div>Weight: ${garageWeight} ${garageWeightSuffix}</div>
        <div>Top Speed: ${garageSpeed}${garageSpeedSuffix} | Gears: ${car.gears}</div>
        <div>Power Adder: ${getPowerAdderDisplayName(car)}</div>
        ${makeBar("Horsepower", car.hp, 1200, " HP")}
        ${makeBar("Torque", Options.torqueUnit === "NM"
        ? Math.round(((_e = car.torque) !== null && _e !== void 0 ? _e : 0) * 1.35582)
        : ((_f = car.torque) !== null && _f !== void 0 ? _f : 0), Options.torqueUnit === "NM" ? 2000 : 1450, Options.torqueUnit === "NM" ? " Nm" : " lb-ft")}
        ${makeBar("Grip", Math.round(car.grip), 360)}
        ${makeBar("Weight", garageWeight, Options.weightUnit === "KG" ? 2948.36 : 6500, garageWeightSuffix)}
        ${makeBar("Top Speed", garageSpeed, Options.speedUnit === "KMH" ? 442.57 : 275, garageSpeedSuffix)}
        ${makeBar("Gears", (_g = car.gears) !== null && _g !== void 0 ? _g : 0, 8)}
        ${makeBar("Max RPM", car.maxRPM, 15000, " RPM")}
        ${makeBar("Shift Speed", Number(((_h = car.shiftSpeed) !== null && _h !== void 0 ? _h : 0.5).toFixed(2)), 1, "s")}
    `;
}
function drawGaragePreview() {
    const canvas = document.getElementById("garageCanvas");
    if (!canvas || !Game.playerCar)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    Render.drawCar(ctx, Game.playerCar, canvas.width / 2, 96, 1);
    setTimeout(drawGaragePreview, 100);
}
const opponentChoices = [
    ...Game.opponentBodyIds
];
let opponentChoiceIndex = 0;
let rimChoiceIndex = 0;
let rimSelectorBodyId = "";
let decalSelectorCarId = "";
function syncOpponentSelector() {
    const selectedBodyId = opponentChoices[opponentChoiceIndex];
    Game.selectedOpponentBodyId =
        selectedBodyId;
    const opponentName = document.getElementById("opponentName");
    const canvas = document.getElementById("opponentCanvas");
    const selector = document.getElementById("opponentSelector");
    const previousButton = document.getElementById("opponentPrevBtn");
    const nextButton = document.getElementById("opponentNextBtn");
    const previewCar = Game.createOpponentCar(selectedBodyId);
    if (selector) {
        selector.classList.toggle("randomOpponent", Game.randomOpponent);
    }
    if (previousButton) {
        previousButton.disabled = Game.randomOpponent;
    }
    if (nextButton) {
        nextButton.disabled = Game.randomOpponent;
    }
    if (opponentName && previewCar) {
        opponentName.innerText =
            Game.randomOpponent
                ? "Random"
                : previewCar.name;
    }
    if (!canvas || !previewCar)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(0, canvas.height - 24, canvas.width, 2);
    Render.drawCar(ctx, previewCar, canvas.width / 2, 65, 1);
}
function changeOpponent(direction) {
    opponentChoiceIndex += direction;
    if (opponentChoiceIndex < 0) {
        opponentChoiceIndex = opponentChoices.length - 1;
    }
    if (opponentChoiceIndex >= opponentChoices.length) {
        opponentChoiceIndex = 0;
    }
    syncOpponentSelector();
}
function getCurrentRimIds() {
    if (!Game.playerCar)
        return [];
    const body = Bodywork.cars[Game.playerCar.bodyId];
    if (!body)
        return [];
    return Object.keys(body.rims);
}
function syncRimSelector() {
    const rimIds = getCurrentRimIds();
    if (rimIds.length === 0)
        return;
    const bodyId = Game.playerCar.bodyId;
    if (rimSelectorBodyId !== bodyId) {
        const currentRimIndex = rimIds.indexOf(Game.playerCar.rimStyle);
        rimChoiceIndex =
            currentRimIndex === -1
                ? 0
                : currentRimIndex;
        rimSelectorBodyId = bodyId;
    }
    if (rimChoiceIndex >= rimIds.length) {
        rimChoiceIndex = 0;
    }
    const rimId = rimIds[rimChoiceIndex];
    const body = Bodywork.cars[Game.playerCar.bodyId];
    const rimName = document.getElementById("rimName");
    const canvas = document.getElementById("rimCanvas");
    if (rimName) {
        rimName.innerText =
            body.rims[rimId];
    }
    if (!canvas)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(2.4, 2.4);
    Bodywork.drawRim(ctx, rimId, 0, 0, 0, 0);
    ctx.restore();
}
function changeRim(direction) {
    const rimIds = getCurrentRimIds();
    if (rimIds.length === 0)
        return;
    rimChoiceIndex += direction;
    if (rimChoiceIndex < 0) {
        rimChoiceIndex = rimIds.length - 1;
    }
    if (rimChoiceIndex >= rimIds.length) {
        rimChoiceIndex = 0;
    }
    syncRimSelector();
    syncDecalSelector();
}
function syncGarageUI() {
    const garageInfo = document.getElementById("garageInfo");
    if (!garageInfo || !Game.playerCar)
        return;
    garageInfo.innerHTML = "";
    const listTitle = document.createElement("div");
    listTitle.innerHTML = "<b>Owned Cars</b>";
    garageInfo.appendChild(listTitle);
    const list = document.createElement("div");
    list.className = "ownedCarList";
    for (const carId of Game.ownedCars) {
        const car = Game.garageCars[carId];
        if (!car)
            continue;
        const isSelected = Game.playerCar.bodyId === car.bodyId;
        const button = document.createElement("button");
        button.className = "ownedCarButton" + (isSelected ? " selected" : "");
        button.innerHTML = `
            <span>${car.name}</span>
            <span>${isSelected ? "Selected" : "Select"}</span>
        `;
        button.disabled = isSelected;
        button.onclick = () => {
            Game.playerCar = car;
            SaveSystem.save(Game);
            syncShopUI();
            syncDealerUI();
            syncGarageUI();
            Game.raceMessage = car.name + " selected!";
            Game.raceMessageTimer = 2;
        };
        list.appendChild(button);
    }
    garageInfo.appendChild(list);
    const selectedPanel = document.createElement("div");
    selectedPanel.className = "carStatPanel";
    selectedPanel.innerHTML = getGarageStatsMarkup(Game.playerCar);
    garageInfo.appendChild(selectedPanel);
    drawGaragePreview();
}
function syncDecalSelector() {
    var _a;
    const decalSelect = document.getElementById("decalSelect");
    const decalColorPicker = document.getElementById("decalColorPicker");
    const decalBtn = document.getElementById("buyDecal");
    if (!decalSelect || !decalColorPicker || !decalBtn || !Game.playerCar)
        return;
    if (decalSelect.options.length !== Decals.options.length) {
        decalSelect.innerHTML = "";
        for (const decal of Decals.options) {
            const option = document.createElement("option");
            option.value = decal.id;
            option.innerText = decal.name;
            decalSelect.appendChild(option);
        }
    }
    const currentDecalId = Game.playerCar.decalId || "none";
    if (decalSelectorCarId !== Game.playerCar.bodyId) {
        decalSelect.value = currentDecalId;
        decalSelectorCarId = Game.playerCar.bodyId;
    }
    if (!decalSelect.value) {
        decalSelect.value = currentDecalId;
    }
    const selectedDecal = Decals.get(decalSelect.value || currentDecalId);
    const decalColor = selectedDecal.id === currentDecalId
        ? Game.playerCar.decalColor || selectedDecal.defaultColor || "#ffffff"
        : selectedDecal.defaultColor || Game.playerCar.decalColor || "#ffffff";
    if (!decalColorPicker.matches(":focus") && decalColorPicker.value !== decalColor) {
        decalColorPicker.value = decalColor;
    }
    decalColorPicker.disabled = !selectedDecal.colorable;
    decalColorPicker.style.display = selectedDecal.colorable ? "inline-block" : "none";
    decalBtn.innerText =
        selectedDecal.id === "none"
            ? "Remove Decal"
            : `Apply Decal ($${(_a = selectedDecal.price) !== null && _a !== void 0 ? _a : Customize.decalPrice})`;
}
function syncShopUI() {
    var _a, _b, _c;
    const tireBtn = document.getElementById("buyTires");
    const engineBtn = document.getElementById("buyEngine");
    const transmissionBtn = document.getElementById("buyTransmission");
    const exhaustBtn = document.getElementById("buyExhaust");
    const ecuBtn = document.getElementById("buyECU");
    const pistonsBtn = document.getElementById("buyPistons");
    const crankBtn = document.getElementById("buyCrank");
    const intakeBtn = document.getElementById("buyIntake");
    const topEndBtn = document.getElementById("buyTopEnd");
    const bottomEndBtn = document.getElementById("buyBottomEnd");
    const turboBtn = document.getElementById("buyTurbo");
    const superchargerBtn = document.getElementById("buySupercharger");
    const displacementBtn = document.getElementById("buyDisplacement");
    const weightReductionBtn = document.getElementById("buyWeightReduction");
    const suspensionBtn = document.getElementById("buySuspension");
    const flywheelBtn = document.getElementById("buyFlywheel");
    const needleBtn = document.getElementById("buyNeedleColor");
    const hubBtn = document.getElementById("buyHubColor");
    const textBtn = document.getElementById("buyTextColor");
    const paintBtn = document.getElementById("buyPaintColor");
    const underglowBtn = document.getElementById("buyUnderglowColor");
    syncGarageUI();
    if (!Game.playerCar)
        return;
    paintBtn.innerText = `Paint Car ($${Customize.paintPrice})`;
    underglowBtn.innerText = `Apply Neon ($${Customize.underglowPrice})`;
    tireBtn.innerText = `Buy Tires (+120 Grip) ($${Game.playerCar.tirePrice})`;
    engineBtn.innerText = `Buy Engine (+25 HP) ($${Game.playerCar.enginePrice})`;
    transmissionBtn.innerText = `Transmission Upgrade (+Top Speed) ($${Game.playerCar.transmissionPrice})`;
    exhaustBtn.innerText = `Buy Exhaust (+8 HP) ($${Game.playerCar.exhaustPrice})`;
    ecuBtn.innerText = `Buy ECU (+3 HP / +35 RPM) ($${Game.playerCar.ecuPrice})`;
    weightReductionBtn.innerText = `Weight Reduction (-120 lbs) ($${Game.playerCar.weightReductionPrice})`;
    suspensionBtn.innerText = `Suspension (+10 Grip) ($${Game.playerCar.suspensionPrice})`;
    flywheelBtn.innerText = `Flywheel (-Shift Time) ($${Game.playerCar.flywheelPrice})`;
    pistonsBtn.innerText = `Pistons (+10 HP / +6 TQ) ($${Game.playerCar.pistonPrice})`;
    crankBtn.innerText = `Crank (+6 HP / +12 TQ) ($${Game.playerCar.crankPrice})`;
    intakeBtn.innerText = `Intake (+4 HP / +3 TQ) ($${Game.playerCar.intakePrice})`;
    topEndBtn.innerText = `Top End (+6 HP / +75 RPM) ($${Game.playerCar.topEndPrice})`;
    bottomEndBtn.innerText = `Bottom End (+13 HP / +10 TQ) ($${Game.playerCar.bottomEndPrice})`;
    turboBtn.innerText = `Turbo (+Spooling Boost) ($${(_a = Game.playerCar.turboPrice) !== null && _a !== void 0 ? _a : 1800})`;
    superchargerBtn.innerText = `Supercharger (+Instant Boost) ($${(_b = Game.playerCar.superchargerPrice) !== null && _b !== void 0 ? _b : 1700})`;
    displacementBtn.innerText = `Displacement / NA+ (+Broad Torque) ($${(_c = Game.playerCar.displacementPrice) !== null && _c !== void 0 ? _c : 1450})`;
    needleBtn.innerText = `Change ($${Customize.needlePrice})`;
    hubBtn.innerText = `Change ($${Customize.hubPrice})`;
    textBtn.innerText = `Change ($${Customize.textPrice})`;
    syncRimSelector();
    syncDecalSelector();
}
let dealerChoiceIndex = 0;
function getDealerPreviewCar(bodyId) {
    return Dealer.createCar(bodyId) || Garage.getMaruMk5();
}
function changeDealerCar(delta) {
    dealerChoiceIndex =
        (dealerChoiceIndex + delta + Dealer.carsForSale.length) %
            Dealer.carsForSale.length;
    syncDealerUI();
}
function syncDealerUI() {
    var _a, _b;
    const listings = document.getElementById("dealerListings");
    if (!listings)
        return;
    if (dealerChoiceIndex >= Dealer.carsForSale.length) {
        dealerChoiceIndex = 0;
    }
    const listing = Dealer.carsForSale[dealerChoiceIndex];
    const owned = Dealer.ownsCar(listing.bodyId);
    const previewCar = Game.garageCars[listing.bodyId] || getDealerPreviewCar(listing.bodyId);
    const isSelected = Game.playerCar && Game.playerCar.bodyId === listing.bodyId;
    listings.innerHTML = `
        <div class="dealerViewer">
            <div class="dealerCard">
                <div class="dealerCarName">${listing.displayName}</div>
                <div>${dealerChoiceIndex + 1} / ${Dealer.carsForSale.length}</div>
                <div class="dealerBio">${listing.description}</div>
                <div>Price: ${listing.price === 0 || owned ? "Owned" : "$" + listing.price}</div>
                <div class="carStatPanel">${getGarageStatsMarkup(previewCar)}</div>
            </div>
        </div>
    `;
    const button = document.createElement("button");
    const testDriveButton = document.createElement("button");
    testDriveButton.innerText = "Test Drive";
    testDriveButton.onclick = () => {
        AudioSystem.init();
        Game.start("testDrive", getDealerPreviewCar(listing.bodyId));
    };
    if (owned) {
        button.innerText = isSelected ? "Selected" : "Select";
        button.disabled = isSelected;
        button.onclick = () => {
            Dealer.selectCar(Game, listing.bodyId);
            syncShopUI();
            syncDealerUI();
            syncGarageUI();
        };
    }
    else {
        button.innerText = `Buy ($${listing.price})`;
        button.onclick = () => {
            Dealer.buyCar(Game, listing.bodyId);
            syncShopUI();
            syncDealerUI();
            syncGarageUI();
        };
    }
    (_a = listings.querySelector(".dealerCard")) === null || _a === void 0 ? void 0 : _a.appendChild(button);
    (_b = listings.querySelector(".dealerCard")) === null || _b === void 0 ? void 0 : _b.appendChild(testDriveButton);
}
const dealerPrevBtn = document.getElementById("dealerPrevBtn");
const dealerNextBtn = document.getElementById("dealerNextBtn");
if (dealerPrevBtn) {
    dealerPrevBtn.onclick = () => {
        changeDealerCar(-1);
    };
}
if (dealerNextBtn) {
    dealerNextBtn.onclick = () => {
        changeDealerCar(1);
    };
}
const saveBtn = document.getElementById("saveBtn");
const loadSlotBtn = document.getElementById("loadSlotBtn");
const renameSaveBtn = document.getElementById("renameSaveBtn");
const deleteSaveBtn = document.getElementById("deleteSaveBtn");
const exportSaveBtn = document.getElementById("exportSaveBtn");
const importSaveBtn = document.getElementById("importSaveBtn");
const importSaveInput = document.getElementById("importSaveInput");
const saveProfiles = document.getElementById("saveProfiles");
const saveProfileNameInput = document.getElementById("saveProfileNameInput");
let selectedSaveSlot = SaveSystem.currentSlot;
const trackSelect = document.getElementById("trackSelect");
const customTrackRow = document.getElementById("customTrackRow");
const opponentPrevBtn = document.getElementById("opponentPrevBtn");
const opponentNextBtn = document.getElementById("opponentNextBtn");
const randomOpponentToggle = document.getElementById("randomOpponentToggle");
function showStatusMessage(message, seconds = 2) {
    Game.raceMessage = message;
    Game.raceMessageTimer = seconds;
    const raceMessage = document.getElementById("raceMessage");
    if (raceMessage) {
        raceMessage.innerText = message;
    }
    window.setTimeout(() => {
        if (Game.raceMessage === message) {
            Game.raceMessage = "";
            Game.raceMessageTimer = 0;
            if (raceMessage) {
                raceMessage.innerText = "";
            }
        }
    }, seconds * 1000);
}
function formatSaveDate(savedAt) {
    if (!savedAt)
        return "Empty";
    const date = new Date(savedAt);
    return Number.isNaN(date.getTime()) ? "Saved" : date.toLocaleString();
}
function updateOptionsUI() {
    document.getElementById("unitSelect").value = Options.speedUnit;
    document.getElementById("torqueUnitSelect").value = Options.torqueUnit;
    document.getElementById("weightUnitSelect").value = Options.weightUnit;
    document.getElementById("laneSelect").value = Options.lane;
    document.getElementById("directionSelect").value = Options.raceDirection;
    document.getElementById("boostUnitSelect").value = Options.boostUnit;
    document.getElementById("muteAudioToggle").checked = Options.audioMuted;
    document.getElementById("audioVolumeSlider").value = String(Math.round(Options.audioVolume * 100));
    document.getElementById("audioVolumeValue").innerText = Math.round(Options.audioVolume * 100) + "%";
    document.getElementById("opponentAudioVolumeSlider").value = String(Math.round(Options.opponentAudioVolume * 100));
    document.getElementById("opponentAudioVolumeValue").innerText = Math.round(Options.opponentAudioVolume * 100) + "%";
}
function applySaveData(save) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    Game.money = (_a = save.money) !== null && _a !== void 0 ? _a : 0;
    Game.ownedCars = (_b = save.ownedCars) !== null && _b !== void 0 ? _b : ["maruMk5"];
    Game.garageCars = (_c = save.garageCars) !== null && _c !== void 0 ? _c : { maruMk5: Garage.getMaruMk5() };
    migrateGarageGripRatings(Game.garageCars);
    migrateGarageTorqueCurves(Game.garageCars);
    migrateGarageBalanceDefaults(Game.garageCars);
    migrateGaragePowerAdderCurves(Game.garageCars);
    Game.playerCar = Game.garageCars[save.selectedCarId] || Game.garageCars.maruMk5 || Garage.getStarter();
    if (save.options) {
        Options.speedUnit = (_d = save.options.speedUnit) !== null && _d !== void 0 ? _d : Options.speedUnit;
        Options.torqueUnit = (_e = save.options.torqueUnit) !== null && _e !== void 0 ? _e : Options.torqueUnit;
        Options.weightUnit = (_f = save.options.weightUnit) !== null && _f !== void 0 ? _f : Options.weightUnit;
        Options.lane = (_g = save.options.lane) !== null && _g !== void 0 ? _g : Options.lane;
        Options.raceDirection = (_h = save.options.raceDirection) !== null && _h !== void 0 ? _h : Options.raceDirection;
        Options.audioMuted = (_j = save.options.audioMuted) !== null && _j !== void 0 ? _j : Options.audioMuted;
        Options.audioVolume = (_k = save.options.audioVolume) !== null && _k !== void 0 ? _k : Options.audioVolume;
        Options.opponentAudioVolume = (_l = save.options.opponentAudioVolume) !== null && _l !== void 0 ? _l : Options.opponentAudioVolume;
        Options.boostUnit = (_m = save.options.boostUnit) !== null && _m !== void 0 ? _m : Options.boostUnit;
    }
    updateOptionsUI();
    AudioSystem.applySettings();
    syncShopUI();
    syncDealerUI();
    syncGarageUI();
}
function syncSaveActionState() {
    const isAutosave = selectedSaveSlot === SaveSystem.autosaveSlot;
    const profile = SaveSystem.getProfile(selectedSaveSlot);
    saveProfileNameInput.disabled = isAutosave;
    saveBtn.disabled = isAutosave;
    renameSaveBtn.disabled = isAutosave;
    deleteSaveBtn.disabled = isAutosave;
    exportSaveBtn.disabled = isAutosave;
    importSaveBtn.disabled = isAutosave;
    loadSlotBtn.disabled = !profile.hasSave;
}
function selectSaveProfile(slot) {
    selectedSaveSlot = slot;
    const profile = SaveSystem.getProfile(slot);
    saveProfileNameInput.value = profile.name;
    syncSaveProfiles();
    syncSaveActionState();
}
function syncSaveProfiles() {
    if (!saveProfiles)
        return;
    saveProfiles.innerHTML = "";
    for (const profile of SaveSystem.getProfiles()) {
        const button = document.createElement("button");
        button.className = "saveProfileButton";
        if (profile.slot === selectedSaveSlot)
            button.classList.add("selected");
        button.innerHTML = `
            <span>
                <span class="saveProfileName">${profile.name}</span><br>
                <span class="saveProfileMeta">${formatSaveDate(profile.savedAt)}</span>
            </span>
            <span>${profile.autosave ? "Load Only" : profile.hasSave ? "Saved" : "Empty"}</span>
        `;
        button.onclick = () => selectSaveProfile(profile.slot);
        saveProfiles.appendChild(button);
    }
}
function exportSelectedSave() {
    const save = SaveSystem.exportSave(selectedSaveSlot);
    if (!save) {
        showStatusMessage(selectedSaveSlot === SaveSystem.autosaveSlot ? "Autosave is load-only." : "No save to export.");
        return;
    }
    const fileName = (save.profileName || SaveSystem.getDefaultProfileName(selectedSaveSlot))
        .replace(/[^a-z0-9_-]+/gi, "-")
        .replace(/^-|-$/g, "") || "redline-save";
    const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
}
opponentPrevBtn.onclick = () => {
    changeOpponent(-1);
};
opponentNextBtn.onclick = () => {
    changeOpponent(1);
};
randomOpponentToggle.onchange = () => {
    Game.randomOpponent = randomOpponentToggle.checked;
    syncOpponentSelector();
};
trackSelect.onchange = () => {
    customTrackRow.classList.toggle("hidden", trackSelect.value !== "custom");
};
saveBtn.onclick = () => {
    const saved = SaveSystem.save(Game, selectedSaveSlot, saveProfileNameInput.value);
    saveProfileNameInput.value = saved.profileName;
    syncSaveProfiles();
    AudioSystem.playSaveChime();
    showStatusMessage("Saved " + saved.profileName + "!");
};
loadSlotBtn.onclick = () => {
    const save = SaveSystem.load(selectedSaveSlot);
    if (!save) {
        showStatusMessage("No save found.");
        return;
    }
    applySaveData(save);
    syncSaveProfiles();
    AudioSystem.playSaveChime();
    showStatusMessage("Loaded " + (save.profileName || SaveSystem.getDefaultProfileName(selectedSaveSlot)) + "!");
};
renameSaveBtn.onclick = () => {
    const renamed = SaveSystem.rename(selectedSaveSlot, saveProfileNameInput.value);
    if (!renamed) {
        saveProfileNameInput.value = saveProfileNameInput.value.trim() || SaveSystem.getDefaultProfileName(selectedSaveSlot);
    }
    syncSaveProfiles();
    showStatusMessage("Profile renamed.");
};
deleteSaveBtn.onclick = () => {
    SaveSystem.deleteSave(selectedSaveSlot);
    saveProfileNameInput.value = SaveSystem.getDefaultProfileName(selectedSaveSlot);
    syncSaveProfiles();
    showStatusMessage("Save deleted.");
};
exportSaveBtn.onclick = () => {
    exportSelectedSave();
};
importSaveBtn.onclick = () => {
    importSaveInput.click();
};
importSaveInput.onchange = () => {
    var _a;
    const file = (_a = importSaveInput.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const save = JSON.parse(String(reader.result));
            const imported = SaveSystem.importSave(selectedSaveSlot, save, saveProfileNameInput.value);
            saveProfileNameInput.value = imported.profileName;
            applySaveData(imported);
            syncSaveProfiles();
            AudioSystem.playSaveChime();
            showStatusMessage("Save imported.");
        }
        catch (_a) {
            showStatusMessage("Import failed.");
        }
        finally {
            importSaveInput.value = "";
        }
    };
    reader.readAsText(file);
};
document.getElementById("startBtn").onclick = () => {
    AudioSystem.init();
    Game.start("race");
};
document.getElementById("practiceBtn").onclick = () => {
    AudioSystem.init();
    Game.start("practice");
};
document.getElementById("raceAgainBtn").onclick = () => {
    Game.raceStarted = false;
    Game.countdownActive = false;
    Game.raceFinished = true;
    Game.raceSummaryVisible = false;
    AudioSystem.stopAllEngines();
    Game.start(Game.runMode, Game.testDriveCar);
};
document.getElementById("backToGarageBtn").onclick = () => {
    Game.raceStarted = false;
    Game.countdownActive = false;
    Game.raceFinished = true;
    Game.raceSummaryVisible = false;
    AudioSystem.stopAllEngines();
    Game.restoreTestDriveCar();
    Menu.showPanel("garagePanel");
};
migrateGarageGripRatings(Game.garageCars);
migrateGarageTorqueCurves(Game.garageCars);
migrateGarageBalanceDefaults(Game.garageCars);
migrateGaragePowerAdderCurves(Game.garageCars);
if (!Game.playerCar) {
    Game.playerCar = Garage.getStarter();
}
document.getElementById("buyTires").onclick = () => {
    Shop.buyTires(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyEngine").onclick = () => {
    Shop.buyEngine(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyTransmission").onclick = () => {
    Shop.buyTransmission(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyExhaust").onclick = () => {
    Shop.buyExhaust(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyECU").onclick = () => {
    Shop.buyECU(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyWeightReduction").onclick = () => {
    Shop.buyWeightReduction(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buySuspension").onclick = () => {
    Shop.buySuspension(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyFlywheel").onclick = () => {
    Shop.buyFlywheel(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyPistons").onclick = () => {
    Shop.buyPistons(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyCrank").onclick = () => {
    Shop.buyCrank(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyIntake").onclick = () => {
    Shop.buyIntake(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyTopEnd").onclick = () => {
    Shop.buyTopEnd(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyBottomEnd").onclick = () => {
    Shop.buyBottomEnd(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyTurbo").onclick = () => {
    Shop.buyTurbo(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buySupercharger").onclick = () => {
    Shop.buySupercharger(Game);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyDisplacement").onclick = () => {
    Shop.buyDisplacement(Game);
    syncShopUI();
    syncGarageUI();
};
const rimBtn = document.getElementById("buyRimStyle");
const rimPrevBtn = document.getElementById("rimPrevBtn");
const rimNextBtn = document.getElementById("rimNextBtn");
rimBtn.innerText =
    "Buy Rims ($" + Customize.rimPrice + ")";
rimPrevBtn.onclick = () => {
    changeRim(-1);
};
rimNextBtn.onclick = () => {
    changeRim(1);
};
rimBtn.onclick = () => {
    const rimIds = getCurrentRimIds();
    const rimId = rimIds[rimChoiceIndex] || Game.playerCar.rimStyle;
    Customize.buyRimStyle(Game, rimId);
    rimSelectorBodyId = "";
    syncShopUI();
    syncGarageUI();
};
const muteAudioToggle = document.getElementById("muteAudioToggle");
const audioVolumeSlider = document.getElementById("audioVolumeSlider");
const audioVolumeValue = document.getElementById("audioVolumeValue");
muteAudioToggle.onchange = () => {
    Options.audioMuted = muteAudioToggle.checked;
    AudioSystem.applySettings();
};
audioVolumeSlider.oninput = () => {
    Options.audioVolume =
        Number(audioVolumeSlider.value) / 100;
    audioVolumeValue.innerText =
        audioVolumeSlider.value + "%";
    AudioSystem.applySettings();
};
document.getElementById("unitSelect").onchange = (e) => {
    const target = e.target;
    Options.speedUnit = target.value;
};
document.getElementById("weightUnitSelect")
    .onchange = (e) => {
    const target = e.target;
    Options.weightUnit = target.value;
    syncGarageUI();
};
document.getElementById("torqueUnitSelect")
    .onchange = (e) => {
    const target = e.target;
    Options.torqueUnit = target.value;
    syncGarageUI();
};
document.getElementById("laneSelect").onchange = (e) => {
    const target = e.target;
    Options.lane = target.value;
};
document.getElementById("directionSelect").onchange = (e) => {
    const target = e.target;
    Options.raceDirection = target.value;
};
document.getElementById("boostUnitSelect").onchange = (e) => {
    const target = e.target;
    Options.boostUnit = target.value;
};
document.getElementById("buyPaintColor").onclick = () => {
    const picker = document.getElementById("paintColorPicker");
    Customize.buyPaintColor(Game, picker.value);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyUnderglowColor").onclick = () => {
    const picker = document.getElementById("underglowColorPicker");
    Customize.buyUnderglowColor(Game, picker.value);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("decalSelect").onchange = () => {
    syncDecalSelector();
};
document.getElementById("buyDecal").onclick = () => {
    const decalSelect = document.getElementById("decalSelect");
    const decalColorPicker = document.getElementById("decalColorPicker");
    Customize.buyDecal(Game, decalSelect.value, decalColorPicker.value);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyNeedleColor").onclick = () => {
    const picker = document.getElementById("needleColorPicker");
    Customize.buyNeedleColor(Game, picker.value);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyHubColor").onclick = () => {
    const picker = document.getElementById("hubColorPicker");
    Customize.buyHubColor(Game, picker.value);
    syncShopUI();
    syncGarageUI();
};
document.getElementById("buyTextColor").onclick = () => {
    const picker = document.getElementById("textColorPicker");
    Customize.buyTextColor(Game, picker.value);
    syncShopUI();
    syncGarageUI();
};
// TEMP bridge so your HTML button still works
window.Game = Game;
window.syncGarageUI = syncGarageUI;
// Initialize systems
Menu.init();
syncOpponentSelector();
syncShopUI();
syncDealerUI();
syncGarageUI();
selectSaveProfile(selectedSaveSlot);
Input.init(Game);
UI.init();
