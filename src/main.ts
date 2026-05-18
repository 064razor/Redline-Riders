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

function makeBar(label: string, value: number, max: number, suffix = "") {
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

function getPowerAdderDisplayName(car: any) {
    const type =
        car?.forcedInductionType || "none";

    if (type === "turbo") return "Turbo";
    if (type === "supercharger") return "Super";
    if (type === "displacement") return "NA+";

    return "NA";
}

function getGarageStatsMarkup(car: any) {
    const garageSpeed =
        Options.speedUnit === "KMH"
            ? Math.round((car.topSpeed ?? 0) * 1.60934)
            : Math.round(car.topSpeed ?? 0);

    const garageSpeedSuffix =
        Options.speedUnit === "KMH"
            ? " KM/H"
            : " MPH";

    const garageWeight =
        Options.weightUnit === "KG"
            ? Math.round((car.weight ?? 0) * 0.453592)
            : car.weight ?? 0;

    const garageWeightSuffix =
        Options.weightUnit === "KG"
            ? " kg"
            : " lbs";

    const engineType =
        car.engineType || getEngineType(car.bodyId);

    const drivetrain =
        car.drivetrain || getDrivetrain(car.bodyId);

    return `
        <div><b>${car.name}</b></div>
        <div>Engine: ${engineType} | Drivetrain: ${drivetrain}</div>
        <div>HP: ${car.hp} | Grip: ${Math.round(car.grip)}</div>
        <div>Weight: ${garageWeight} ${garageWeightSuffix}</div>
        <div>Top Speed: ${garageSpeed}${garageSpeedSuffix} | Gears: ${car.gears}</div>
        <div>Power Adder: ${getPowerAdderDisplayName(car)}</div>
        ${makeBar("Horsepower", car.hp, 1200, " HP")}
        ${makeBar(
            "Torque",
            Options.torqueUnit === "NM"
                ? Math.round((car.torque ?? 0) * 1.35582)
                : (car.torque ?? 0),
            Options.torqueUnit === "NM" ? 2000 : 1450,
            Options.torqueUnit === "NM" ? " Nm" : " lb-ft"
        )}
        ${makeBar("Grip", Math.round(car.grip), 360)}
        ${makeBar("Weight", garageWeight, Options.weightUnit === "KG" ? 2948.36 : 6500, garageWeightSuffix)}
        ${makeBar("Top Speed", garageSpeed, Options.speedUnit === "KMH" ? 442.57 : 275, garageSpeedSuffix)}
        ${makeBar("Gears", car.gears ?? 0, 8)}
        ${makeBar("Max RPM", car.maxRPM, 15000, " RPM")}
        ${makeBar("Shift Speed", Number((car.shiftSpeed ?? 0.5).toFixed(2)), 1, "s")}
    `;
}

function drawGaragePreview() {
    const canvas =
        document.getElementById("garageCanvas") as HTMLCanvasElement;

    if (!canvas || !Game.playerCar) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Render.drawCar(
        ctx,
        Game.playerCar,
        canvas.width / 2,
        96,
        1
    );

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
    const selectedBodyId =
        opponentChoices[opponentChoiceIndex];

    Game.selectedOpponentBodyId =
        selectedBodyId;

    const opponentName =
        document.getElementById("opponentName") as HTMLDivElement;

    const canvas =
        document.getElementById("opponentCanvas") as HTMLCanvasElement;

    const selector =
        document.getElementById("opponentSelector") as HTMLDivElement;

    const previousButton =
        document.getElementById("opponentPrevBtn") as HTMLButtonElement;

    const nextButton =
        document.getElementById("opponentNextBtn") as HTMLButtonElement;

    const previewCar =
        Game.createOpponentCar(selectedBodyId);

    if (selector) {
        selector.classList.toggle(
            "randomOpponent",
            Game.randomOpponent
        );
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

    if (!canvas || !previewCar) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(0, canvas.height - 24, canvas.width, 2);

    Render.drawCar(
        ctx,
        previewCar,
        canvas.width / 2,
        65,
        1
    );
}

function changeOpponent(direction: number) {
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
    if (!Game.playerCar) return [];

    const body =
        Bodywork.cars[Game.playerCar.bodyId as keyof typeof Bodywork.cars];

    if (!body) return [];

    return Object.keys(body.rims);
}

function syncRimSelector() {
    const rimIds = getCurrentRimIds();
    if (rimIds.length === 0) return;

    const bodyId =
        Game.playerCar.bodyId;

    if (rimSelectorBodyId !== bodyId) {
        const currentRimIndex =
            rimIds.indexOf(Game.playerCar.rimStyle);

        rimChoiceIndex =
            currentRimIndex === -1
                ? 0
                : currentRimIndex;

        rimSelectorBodyId = bodyId;
    }

    if (rimChoiceIndex >= rimIds.length) {
        rimChoiceIndex = 0;
    }

    const rimId =
        rimIds[rimChoiceIndex];

    const body =
        Bodywork.cars[Game.playerCar.bodyId as keyof typeof Bodywork.cars];

    const rimName =
        document.getElementById("rimName") as HTMLDivElement;

    const canvas =
        document.getElementById("rimCanvas") as HTMLCanvasElement;

    if (rimName) {
        rimName.innerText =
            body.rims[rimId as keyof typeof body.rims];
    }

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(2.4, 2.4);

    Bodywork.drawRim(
        ctx,
        rimId,
        0,
        0,
        0,
        0
    );

    ctx.restore();
}

function changeRim(direction: number) {
    const rimIds = getCurrentRimIds();
    if (rimIds.length === 0) return;

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
    const garageInfo =
        document.getElementById("garageInfo") as HTMLDivElement;

    if (!garageInfo || !Game.playerCar) return;

    garageInfo.innerHTML = "";

    const listTitle = document.createElement("div");
    listTitle.innerHTML = "<b>Owned Cars</b>";
    garageInfo.appendChild(listTitle);

    const list = document.createElement("div");
    list.className = "ownedCarList";

    for (const carId of Game.ownedCars) {
        const car = Game.garageCars[carId];

        if (!car) continue;

        const isSelected =
            Game.playerCar.bodyId === car.bodyId;

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
    const decalSelect =
        document.getElementById("decalSelect") as HTMLSelectElement;

    const decalColorPicker =
        document.getElementById("decalColorPicker") as HTMLInputElement;

    const decalBtn =
        document.getElementById("buyDecal") as HTMLButtonElement;

    if (!decalSelect || !decalColorPicker || !decalBtn || !Game.playerCar) return;

    if (decalSelect.options.length !== Decals.options.length) {
        decalSelect.innerHTML = "";

        for (const decal of Decals.options) {
            const option = document.createElement("option");
            option.value = decal.id;
            option.innerText = decal.name;
            decalSelect.appendChild(option);
        }
    }

    const currentDecalId =
        Game.playerCar.decalId || "none";

    if (decalSelectorCarId !== Game.playerCar.bodyId) {
        decalSelect.value = currentDecalId;
        decalSelectorCarId = Game.playerCar.bodyId;
    }

    if (!decalSelect.value) {
        decalSelect.value = currentDecalId;
    }

    const selectedDecal =
        Decals.get(decalSelect.value || currentDecalId);

    const decalColor =
        selectedDecal.id === currentDecalId
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
            : `Apply Decal ($${selectedDecal.price ?? Customize.decalPrice})`;
}

function syncShopUI() {
    const tireBtn = document.getElementById("buyTires") as HTMLButtonElement;
    const engineBtn = document.getElementById("buyEngine") as HTMLButtonElement;
    const transmissionBtn = document.getElementById("buyTransmission") as HTMLButtonElement;
    const exhaustBtn = document.getElementById("buyExhaust") as HTMLButtonElement;
    const ecuBtn = document.getElementById("buyECU") as HTMLButtonElement;
    const pistonsBtn = document.getElementById("buyPistons") as HTMLButtonElement;
    const crankBtn = document.getElementById("buyCrank") as HTMLButtonElement;
    const intakeBtn = document.getElementById("buyIntake") as HTMLButtonElement;
    const topEndBtn = document.getElementById("buyTopEnd") as HTMLButtonElement;
    const bottomEndBtn = document.getElementById("buyBottomEnd") as HTMLButtonElement;
    const turboBtn = document.getElementById("buyTurbo") as HTMLButtonElement;
    const superchargerBtn = document.getElementById("buySupercharger") as HTMLButtonElement;
    const displacementBtn = document.getElementById("buyDisplacement") as HTMLButtonElement;
    const weightReductionBtn = document.getElementById("buyWeightReduction") as HTMLButtonElement;
    const suspensionBtn = document.getElementById("buySuspension") as HTMLButtonElement;
    const flywheelBtn = document.getElementById("buyFlywheel") as HTMLButtonElement;
    const needleBtn = document.getElementById("buyNeedleColor") as HTMLButtonElement;
    const hubBtn = document.getElementById("buyHubColor") as HTMLButtonElement;
    const textBtn = document.getElementById("buyTextColor") as HTMLButtonElement;
    const paintBtn = document.getElementById("buyPaintColor") as HTMLButtonElement;
    const underglowBtn = document.getElementById("buyUnderglowColor") as HTMLButtonElement;

    syncGarageUI();

    if (!Game.playerCar) return;

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
    turboBtn.innerText = `Turbo (+Spooling Boost) ($${Game.playerCar.turboPrice ?? 1800})`;
    superchargerBtn.innerText = `Supercharger (+Instant Boost) ($${Game.playerCar.superchargerPrice ?? 1700})`;
    displacementBtn.innerText = `Displacement / NA+ (+Broad Torque) ($${Game.playerCar.displacementPrice ?? 1450})`;

    needleBtn.innerText = `Change ($${Customize.needlePrice})`;
    hubBtn.innerText = `Change ($${Customize.hubPrice})`;
    textBtn.innerText = `Change ($${Customize.textPrice})`;

    syncRimSelector();
    syncDecalSelector();
}

let dealerChoiceIndex = 0;

function getDealerPreviewCar(bodyId: string) {
    return Dealer.createCar(bodyId) || Garage.getMaruMk5();
}

function changeDealerCar(delta: number) {
    dealerChoiceIndex =
        (dealerChoiceIndex + delta + Dealer.carsForSale.length) %
        Dealer.carsForSale.length;

    syncDealerUI();
}

function syncDealerUI() {
    const listings = document.getElementById("dealerListings") as HTMLDivElement;
    if (!listings) return;

    if (dealerChoiceIndex >= Dealer.carsForSale.length) {
        dealerChoiceIndex = 0;
    }

    const listing =
        Dealer.carsForSale[dealerChoiceIndex];

    const owned =
        Dealer.ownsCar(listing.bodyId);

    const previewCar =
        Game.garageCars[listing.bodyId] || getDealerPreviewCar(listing.bodyId);

    const isSelected =
        Game.playerCar && Game.playerCar.bodyId === listing.bodyId;

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

    listings.querySelector(".dealerCard")?.appendChild(button);
    listings.querySelector(".dealerCard")?.appendChild(testDriveButton);
}
const dealerPrevBtn =
    document.getElementById("dealerPrevBtn") as HTMLButtonElement;
const dealerNextBtn =
    document.getElementById("dealerNextBtn") as HTMLButtonElement;

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
const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
const loadSlotBtn = document.getElementById("loadSlotBtn") as HTMLButtonElement;
const renameSaveBtn = document.getElementById("renameSaveBtn") as HTMLButtonElement;
const deleteSaveBtn = document.getElementById("deleteSaveBtn") as HTMLButtonElement;
const exportSaveBtn = document.getElementById("exportSaveBtn") as HTMLButtonElement;
const importSaveBtn = document.getElementById("importSaveBtn") as HTMLButtonElement;
const importSaveInput = document.getElementById("importSaveInput") as HTMLInputElement;
const saveProfiles = document.getElementById("saveProfiles") as HTMLDivElement;
const saveProfileNameInput = document.getElementById("saveProfileNameInput") as HTMLInputElement;
let selectedSaveSlot = SaveSystem.currentSlot;
const trackSelect =
    document.getElementById("trackSelect") as HTMLSelectElement;

const customTrackRow =
    document.getElementById("customTrackRow") as HTMLDivElement;

const opponentPrevBtn =
    document.getElementById("opponentPrevBtn") as HTMLButtonElement;

const opponentNextBtn =
    document.getElementById("opponentNextBtn") as HTMLButtonElement;

const randomOpponentToggle =
    document.getElementById("randomOpponentToggle") as HTMLInputElement;

function showStatusMessage(message: string, seconds = 2) {
    Game.raceMessage = message;
    Game.raceMessageTimer = seconds;

    const raceMessage =
        document.getElementById("raceMessage");

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
function formatSaveDate(savedAt: string) {
    if (!savedAt) return "Empty";
    const date = new Date(savedAt);
    return Number.isNaN(date.getTime()) ? "Saved" : date.toLocaleString();
}

function updateOptionsUI() {
    (document.getElementById("unitSelect") as HTMLSelectElement).value = Options.speedUnit;
    (document.getElementById("torqueUnitSelect") as HTMLSelectElement).value = Options.torqueUnit;
    (document.getElementById("weightUnitSelect") as HTMLSelectElement).value = Options.weightUnit;
    (document.getElementById("laneSelect") as HTMLSelectElement).value = Options.lane;
    (document.getElementById("directionSelect") as HTMLSelectElement).value = Options.raceDirection;
    (document.getElementById("boostUnitSelect") as HTMLSelectElement).value = Options.boostUnit;
    (document.getElementById("muteAudioToggle") as HTMLInputElement).checked = Options.audioMuted;
    (document.getElementById("audioVolumeSlider") as HTMLInputElement).value = String(Math.round(Options.audioVolume * 100));
    (document.getElementById("audioVolumeValue") as HTMLSpanElement).innerText = Math.round(Options.audioVolume * 100) + "%";
    (document.getElementById("opponentAudioVolumeSlider") as HTMLInputElement).value = String(Math.round(Options.opponentAudioVolume * 100));
    (document.getElementById("opponentAudioVolumeValue") as HTMLSpanElement).innerText = Math.round(Options.opponentAudioVolume * 100) + "%";
}

function applySaveData(save: any) {
    Game.money = save.money ?? 0;
    Game.ownedCars = save.ownedCars ?? ["maruMk5"];
    Game.garageCars = save.garageCars ?? { maruMk5: Garage.getMaruMk5() };
    migrateGarageGripRatings(Game.garageCars);
    migrateGarageTorqueCurves(Game.garageCars);
    migrateGarageBalanceDefaults(Game.garageCars);
    migrateGaragePowerAdderCurves(Game.garageCars);
    Game.playerCar = Game.garageCars[save.selectedCarId] || Game.garageCars.maruMk5 || Garage.getStarter();

    if (save.options) {
        Options.speedUnit = save.options.speedUnit ?? Options.speedUnit;
        Options.torqueUnit = save.options.torqueUnit ?? Options.torqueUnit;
        Options.weightUnit = save.options.weightUnit ?? Options.weightUnit;
        Options.lane = save.options.lane ?? Options.lane;
        Options.raceDirection = save.options.raceDirection ?? Options.raceDirection;
        Options.audioMuted = save.options.audioMuted ?? Options.audioMuted;
        Options.audioVolume = save.options.audioVolume ?? Options.audioVolume;
        Options.opponentAudioVolume = save.options.opponentAudioVolume ?? Options.opponentAudioVolume;
        Options.boostUnit = save.options.boostUnit ?? Options.boostUnit;
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

function selectSaveProfile(slot: number) {
    selectedSaveSlot = slot;
    const profile = SaveSystem.getProfile(slot);
    saveProfileNameInput.value = profile.name;
    syncSaveProfiles();
    syncSaveActionState();
}

function syncSaveProfiles() {
    if (!saveProfiles) return;
    saveProfiles.innerHTML = "";

    for (const profile of SaveSystem.getProfiles()) {
        const button = document.createElement("button");
        button.className = "saveProfileButton";
        if (profile.slot === selectedSaveSlot) button.classList.add("selected");
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
    customTrackRow.classList.toggle(
        "hidden",
        trackSelect.value !== "custom"
    );
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
    const file = importSaveInput.files?.[0];
    if (!file) return;
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
        catch {
            showStatusMessage("Import failed.");
        }
        finally {
            importSaveInput.value = "";
        }
    };
    reader.readAsText(file);
};
(document.getElementById("startBtn") as HTMLButtonElement).onclick = () => {
    AudioSystem.init();
    Game.start("race");
};

(document.getElementById("practiceBtn") as HTMLButtonElement).onclick = () => {
    AudioSystem.init();
    Game.start("practice");
};

(document.getElementById("raceAgainBtn") as HTMLButtonElement).onclick = () => {
    Game.raceStarted = false;
    Game.countdownActive = false;
    Game.raceFinished = true;
    Game.raceSummaryVisible = false;

    AudioSystem.stopAllEngines();

    Game.start(Game.runMode, Game.testDriveCar);
};

(document.getElementById("backToGarageBtn") as HTMLButtonElement).onclick = () => {
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

(document.getElementById("buyTires") as HTMLButtonElement).onclick = () => {
    Shop.buyTires(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyEngine") as HTMLButtonElement).onclick = () => {
    Shop.buyEngine(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyTransmission") as HTMLButtonElement).onclick = () => {
    Shop.buyTransmission(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyExhaust") as HTMLButtonElement).onclick = () => {
    Shop.buyExhaust(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyECU") as HTMLButtonElement).onclick = () => {
    Shop.buyECU(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyWeightReduction") as HTMLButtonElement).onclick = () => {
    Shop.buyWeightReduction(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buySuspension") as HTMLButtonElement).onclick = () => {
    Shop.buySuspension(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyFlywheel") as HTMLButtonElement).onclick = () => {
    Shop.buyFlywheel(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyPistons") as HTMLButtonElement).onclick = () => {
    Shop.buyPistons(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyCrank") as HTMLButtonElement).onclick = () => {
    Shop.buyCrank(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyIntake") as HTMLButtonElement).onclick = () => {
    Shop.buyIntake(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyTopEnd") as HTMLButtonElement).onclick = () => {
    Shop.buyTopEnd(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyBottomEnd") as HTMLButtonElement).onclick = () => {
    Shop.buyBottomEnd(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyTurbo") as HTMLButtonElement).onclick = () => {
    Shop.buyTurbo(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buySupercharger") as HTMLButtonElement).onclick = () => {
    Shop.buySupercharger(Game);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyDisplacement") as HTMLButtonElement).onclick = () => {
    Shop.buyDisplacement(Game);
    syncShopUI();
    syncGarageUI();
};

const rimBtn =
    document.getElementById("buyRimStyle") as HTMLButtonElement;

const rimPrevBtn =
    document.getElementById("rimPrevBtn") as HTMLButtonElement;

const rimNextBtn =
    document.getElementById("rimNextBtn") as HTMLButtonElement;

rimBtn.innerText =
    "Buy Rims ($" + Customize.rimPrice + ")";

rimPrevBtn.onclick = () => {
    changeRim(-1);
};

rimNextBtn.onclick = () => {
    changeRim(1);
};

rimBtn.onclick = () => {
    const rimIds =
        getCurrentRimIds();

    const rimId =
        rimIds[rimChoiceIndex] || Game.playerCar.rimStyle;

    Customize.buyRimStyle(Game, rimId);
    rimSelectorBodyId = "";
    syncShopUI();
    syncGarageUI();
};

const muteAudioToggle =
    document.getElementById("muteAudioToggle") as HTMLInputElement;

const audioVolumeSlider =
    document.getElementById("audioVolumeSlider") as HTMLInputElement;

const audioVolumeValue =
    document.getElementById("audioVolumeValue") as HTMLSpanElement;

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

(document.getElementById("unitSelect") as HTMLSelectElement).onchange = (e) => {
    const target = e.target as HTMLSelectElement;
    Options.speedUnit = target.value;
};

(document.getElementById("weightUnitSelect") as HTMLSelectElement)
.onchange = (e) => {
    const target = e.target as HTMLSelectElement;

    Options.weightUnit = target.value;

    syncGarageUI();
};

(document.getElementById("torqueUnitSelect") as HTMLSelectElement)
.onchange = (e) => {

    const target = e.target as HTMLSelectElement;

    Options.torqueUnit = target.value;

    syncGarageUI();
};

(document.getElementById("laneSelect") as HTMLSelectElement).onchange = (e) => {
    const target = e.target as HTMLSelectElement;
    Options.lane = target.value;
};

(document.getElementById("directionSelect") as HTMLSelectElement).onchange = (e) => {
    const target = e.target as HTMLSelectElement;
    Options.raceDirection = target.value;
};

(document.getElementById("boostUnitSelect") as HTMLSelectElement).onchange = (e) => {
    const target = e.target as HTMLSelectElement;
    Options.boostUnit = target.value;
};

(document.getElementById("buyPaintColor") as HTMLButtonElement).onclick = () => {
    const picker =
        document.getElementById("paintColorPicker") as HTMLInputElement;

    Customize.buyPaintColor(Game, picker.value);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyUnderglowColor") as HTMLButtonElement).onclick = () => {
    const picker =
        document.getElementById("underglowColorPicker") as HTMLInputElement;

    Customize.buyUnderglowColor(Game, picker.value);
    syncShopUI();
    syncGarageUI();
};
(document.getElementById("decalSelect") as HTMLSelectElement).onchange = () => {
    syncDecalSelector();
};

(document.getElementById("buyDecal") as HTMLButtonElement).onclick = () => {
    const decalSelect =
        document.getElementById("decalSelect") as HTMLSelectElement;

    const decalColorPicker =
        document.getElementById("decalColorPicker") as HTMLInputElement;

    Customize.buyDecal(Game, decalSelect.value, decalColorPicker.value);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyNeedleColor") as HTMLButtonElement).onclick = () => {
    const picker =
        document.getElementById("needleColorPicker") as HTMLInputElement;

    Customize.buyNeedleColor(Game, picker.value);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyHubColor") as HTMLButtonElement).onclick = () => {
    const picker =
        document.getElementById("hubColorPicker") as HTMLInputElement;

    Customize.buyHubColor(Game, picker.value);
    syncShopUI();
    syncGarageUI();
};

(document.getElementById("buyTextColor") as HTMLButtonElement).onclick = () => {
    const picker =
        document.getElementById("textColorPicker") as HTMLInputElement;

    Customize.buyTextColor(Game, picker.value);
    syncShopUI();
    syncGarageUI();
};

// TEMP bridge so your HTML button still works
(window as any).Game = Game;
(window as any).syncGarageUI = syncGarageUI;

// Initialize systems
Menu.init();
syncOpponentSelector();
syncShopUI();
syncDealerUI();
syncGarageUI();
selectSaveProfile(selectedSaveSlot);
Input.init(Game);
UI.init();
