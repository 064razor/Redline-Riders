import { SaveSystem } from "./save.js";
import { Dealer } from "./dealer.js";
import { Game } from "./game.js";
import { Bodywork } from "./bodywork.js";
import { Menu } from "./menu.js";
import { Input } from "./input.js";
import { Garage, getEngineType, getDrivetrain, migrateGarageGripRatings, migrateGarageTorqueCurves, migrateGarageBalanceDefaults, migrateGaragePowerAdderCurves, migrateGarageDragCoefficients, migrateGarageArchetypes, getCarArchetype } from "./garage.js";
import { AudioSystem } from "./audio.js";
import { Render } from "./render.js";
import { Options } from "./options.js";
import { UI } from "./ui.js";
import { Shop } from "./shop.js";
import { Customize } from "./customize.js";
import { Decals } from "./decals.js";
import { Events } from "./events.js";
import { clamp, getBoostTorqueMultiplier, getCurveMultiplier, getEstimatedBoostPsi } from "./power.js";

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

function getAspirationDisplayName(car: any) {
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

    const dragCoefficient =
        Number.isFinite(car.dragCoefficient)
            ? car.dragCoefficient
            : 0.34;

    const archetype =
        car.archetypeName
            ? {
                name: car.archetypeName,
                focus: car.archetypeFocus,
                strengths: car.archetypeStrengths || [],
                cautions: car.archetypeCautions || []
            }
            : getCarArchetype(car.bodyId);

    return `
        <div><b>${car.name}</b></div>
        <div>Archetype: ${archetype.name}</div>
        <div style="color:#c9d6e6;">${archetype.focus}</div>
        <div>Strengths: ${archetype.strengths.join(", ")}</div>
        <div>Cautions: ${archetype.cautions.join(", ")}</div>
        <div>Engine: ${engineType} | Drivetrain: ${drivetrain}</div>
        <div>HP: ${car.hp} | Grip: ${Math.round(car.grip)}</div>
        <div>Weight: ${garageWeight} ${garageWeightSuffix}</div>
        <div>Top Speed: ${garageSpeed}${garageSpeedSuffix} | Gears: ${car.gears}</div>
        <div>Drag Coeff: ${dragCoefficient.toFixed(3)}</div>
        <div>Aspiration: ${getAspirationDisplayName(car)}</div>
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

function getGraphTorqueAtRpm(car: any, rpm: number) {
    const maxRPM =
        Math.max(car?.maxRPM || 7000, 1000);

    const rpmRatio =
        clamp(rpm / maxRPM, 0, 1);

    const boostPsi =
        getEstimatedBoostPsi(car, rpmRatio);

    return Math.max(
        1,
        (car?.torque || 1) *
        getCurveMultiplier(car?.torqueCurve, rpmRatio) *
        getBoostTorqueMultiplier(car, boostPsi, rpmRatio)
    );
}

function drawPowerTorqueGraph(canvas: HTMLCanvasElement, car: any) {
    const ctx =
        canvas.getContext("2d");

    if (!ctx || !car) return;

    const width =
        canvas.width;

    const height =
        canvas.height;

    const paddingLeft = 38;
    const paddingRight = 12;
    const paddingTop = 18;
    const paddingBottom = 30;
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#101216";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#2c323c";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
        const y =
            paddingTop + graphHeight * (i / 4);

        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
    }

    for (let i = 0; i <= 5; i++) {
        const x =
            paddingLeft + graphWidth * (i / 5);

        ctx.beginPath();
        ctx.moveTo(x, paddingTop);
        ctx.lineTo(x, paddingTop + graphHeight);
        ctx.stroke();
    }

    const maxRPM =
        Math.max(car.maxRPM || 7000, 1000);

    const torqueUnit =
        Options.torqueUnit === "NM" ? "Nm" : "lb-ft";

    const torqueScale =
        Options.torqueUnit === "NM" ? 1.35582 : 1;

    const samples = [];
    let maxTorque = 1;
    let maxHorsepower = 1;

    for (let i = 0; i <= 48; i++) {
        const rpm =
            1000 + ((maxRPM - 1000) * (i / 48));

        const torque =
            getGraphTorqueAtRpm(car, rpm) * torqueScale;

        const horsepower =
            torque * rpm / 5252;

        samples.push({ rpm, torque, horsepower });

        maxTorque =
            Math.max(maxTorque, torque);

        maxHorsepower =
            Math.max(maxHorsepower, horsepower);
    }

    const maxValue =
        Math.max(maxTorque, maxHorsepower) * 1.12;

    function pointX(rpm: number) {
        return paddingLeft + ((rpm - 1000) / Math.max(maxRPM - 1000, 1)) * graphWidth;
    }

    function pointY(value: number) {
        return paddingTop + graphHeight - (value / maxValue) * graphHeight;
    }

    function drawLine(
        key: "torque" | "horsepower",
        color: string
    ) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();

        samples.forEach((sample, index) => {
            const x =
                pointX(sample.rpm);

            const y =
                pointY(sample[key]);

            if (index === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    drawLine("torque", "#ff4fb8");
    drawLine("horsepower", "#37d8ff");

    const peakTorqueSample =
        samples.reduce((best, sample) =>
            sample.torque > best.torque ? sample : best
        );

    const peakHorsepowerSample =
        samples.reduce((best, sample) =>
            sample.horsepower > best.horsepower ? sample : best
        );

    function drawPeakLabel(
        sample: { rpm: number; torque: number; horsepower: number },
        key: "torque" | "horsepower",
        color: string,
        text: string,
        yOffset: number
    ) {
        const x =
            pointX(sample.rpm);

        const y =
            pointY(sample[key]);

        const labelX =
            clamp(x, paddingLeft + 34, width - paddingRight - 34);

        const labelY =
            clamp(y + yOffset, paddingTop + 10, paddingTop + graphHeight - 8);

        ctx.fillStyle = "rgba(16, 18, 22, 0.86)";
        ctx.fillRect(labelX - 30, labelY - 8, 60, 14);

        ctx.fillStyle = color;
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(text, labelX, labelY + 3);

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPeakLabel(
        peakTorqueSample,
        "torque",
        "#ff4fb8",
        Math.round(peakTorqueSample.torque).toString(),
        -10
    );

    drawPeakLabel(
        peakHorsepowerSample,
        "horsepower",
        "#37d8ff",
        Math.round(peakHorsepowerSample.horsepower).toString(),
        12
    );

    ctx.strokeStyle = "#566070";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(paddingLeft, paddingTop, graphWidth, graphHeight);

    ctx.fillStyle = "#dbe6f5";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Power / Torque", paddingLeft, 12);

    ctx.font = "10px Arial";
    ctx.fillStyle = "#ff4fb8";
    ctx.fillText("Torque (" + torqueUnit + ")", paddingLeft + 112, 12);

    ctx.fillStyle = "#37d8ff";
    ctx.fillText("HP", paddingLeft + 205, 12);

    ctx.fillStyle = "#aeb8c7";
    ctx.textAlign = "center";
    ctx.fillText("RPM", paddingLeft + graphWidth / 2, height - 8);

    ctx.textAlign = "right";
    ctx.fillText("1k", paddingLeft, height - 8);
    ctx.fillText(Math.round(maxRPM / 1000) + "k", width - paddingRight, height - 8);

    ctx.save();
    ctx.translate(11, paddingTop + graphHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Output", 0, 0);
    ctx.restore();
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
let eventPageIndex = 0;
const eventsPerPage = 4;

function bindMenuSounds() {
    let lastHoverSoundTime = 0;

    const isPurchaseButton = (button: HTMLButtonElement) =>
        button.dataset.purchaseSound === "true" ||
        button.id.startsWith("buy");

    document.addEventListener("mouseover", (event) => {
        const button =
            (event.target as HTMLElement).closest("button") as HTMLButtonElement | null;

        if (!button || button.disabled) return;

        const now =
            performance.now();

        if (now - lastHoverSoundTime < 45) return;

        lastHoverSoundTime = now;
        AudioSystem.playHover();
    });

    document.addEventListener("pointerdown", (event) => {
        const button =
            (event.target as HTMLElement).closest("button") as HTMLButtonElement | null;

        if (!button || button.disabled || !isPurchaseButton(button)) return;

        button.dataset.previousMoney = String(Game.money);
        button.dataset.previousMessage = Game.raceMessage || "";
    });

    document.addEventListener("click", (event) => {
        const button =
            (event.target as HTMLElement).closest("button") as HTMLButtonElement | null;

        if (!button || button.disabled) return;

        if (isPurchaseButton(button)) {
            playPurchaseIfChanged(
                Number(button.dataset.previousMoney ?? Game.money),
                button.dataset.previousMessage ?? ""
            );
            return;
        }

        AudioSystem.playSelect();
    });
}

function markPurchaseButton(button: HTMLButtonElement | null) {
    if (!button) return;

    button.dataset.purchaseSound = "true";
}

function playPurchaseIfChanged(
    previousMoney: number,
    previousMessage: string
) {
    if (
        Game.money < previousMoney &&
        Game.raceMessage !== previousMessage &&
        !/not enough|cannot|missing|already/i.test(Game.raceMessage || "")
    ) {
        AudioSystem.playPurchase();
    }
}

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

    const graphCanvas = document.createElement("canvas");
    graphCanvas.className = "powerTorqueGraph";
    graphCanvas.width = 420;
    graphCanvas.height = 180;
    selectedPanel.appendChild(graphCanvas);

    garageInfo.appendChild(selectedPanel);

    drawPowerTorqueGraph(graphCanvas, Game.playerCar);
    drawGaragePreview();
}

function drawDecalPreview() {
    const canvas =
        document.getElementById("decalPreviewCanvas") as HTMLCanvasElement;

    const decalSelect =
        document.getElementById("decalSelect") as HTMLSelectElement;

    const decalColorPicker =
        document.getElementById("decalColorPicker") as HTMLInputElement;

    if (!canvas || !decalSelect || !decalColorPicker || !Game.playerCar) return;

    const ctx =
        canvas.getContext("2d");

    if (!ctx) return;

    const selectedDecal =
        Decals.get(decalSelect.value || Game.playerCar.decalId || "none");

    const previewCar = {
        ...Game.playerCar,
        paintColor: Game.playerCar.paintColor || "#ffffff",
        decalId: selectedDecal.id,
        decalColor: selectedDecal.colorable
            ? decalColorPicker.value || selectedDecal.defaultColor || "#ffffff"
            : Game.playerCar.decalColor || selectedDecal.defaultColor || "#ffffff",
        wheelspin: false,
        shiftJoltTimer: 0,
        boostPsi: 0,
        turboSpool: 0
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#20242b";
    ctx.fillRect(22, 58, canvas.width - 44, 2);

    Render.drawCar(
        ctx,
        previewCar,
        canvas.width / 2,
        31,
        1
    );
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

    drawDecalPreview();
    window.setTimeout(drawDecalPreview, 120);
    window.setTimeout(drawDecalPreview, 320);
}

function syncShopUI() {
    const tireBtn = document.getElementById("buyTires") as HTMLButtonElement;
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
    const aeroBtn = document.getElementById("buyAero") as HTMLButtonElement;
    const flywheelBtn = document.getElementById("buyFlywheel") as HTMLButtonElement;
    const needleBtn = document.getElementById("buyNeedleColor") as HTMLButtonElement;
    const hubBtn = document.getElementById("buyHubColor") as HTMLButtonElement;
    const textBtn = document.getElementById("buyTextColor") as HTMLButtonElement;
    const paintBtn = document.getElementById("buyPaintColor") as HTMLButtonElement;
    const underglowBtn = document.getElementById("buyUnderglowColor") as HTMLButtonElement;

    syncGarageUI();

    if (!Game.playerCar) return;

    const dragCoefficient =
        Number.isFinite(Game.playerCar.dragCoefficient)
            ? Game.playerCar.dragCoefficient
            : 0.34;

    const nextDragCoefficient =
        Math.max(0.24, Number((dragCoefficient - 0.005).toFixed(3)));

    paintBtn.innerText = `Paint Car ($${Customize.paintPrice})`;
    underglowBtn.innerText = `Apply Neon ($${Customize.underglowPrice})`;

    tireBtn.innerText = `Buy Tires (+120 Grip) ($${Game.playerCar.tirePrice})`;
    transmissionBtn.innerText = `Transmission Upgrade (+Top Speed) ($${Game.playerCar.transmissionPrice})`;
    exhaustBtn.innerText = `Buy Exhaust (+8 HP) ($${Game.playerCar.exhaustPrice})`;
    ecuBtn.innerText = `Buy ECU (+3 HP / +35 RPM) ($${Game.playerCar.ecuPrice})`;
    weightReductionBtn.innerText = `Weight Reduction (-120 lbs) ($${Game.playerCar.weightReductionPrice})`;
    suspensionBtn.innerText = `Suspension (+10 Grip) ($${Game.playerCar.suspensionPrice})`;
    aeroBtn.innerText =
        dragCoefficient <= 0.24
            ? `Aero Maxed (Cd ${dragCoefficient.toFixed(3)})`
            : `Aero (Cd ${dragCoefficient.toFixed(3)} -> ${nextDragCoefficient.toFixed(3)}) ($${Game.playerCar.aeroPrice ?? 575})`;
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

function drawDealerIcon(car: any) {
    const canvas =
        document.getElementById("dealerIconCanvas") as HTMLCanvasElement;

    if (!canvas || !car) return;

    const ctx =
        canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(18, 78, canvas.width - 36, 2);

    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";

    for (let x = 38; x < canvas.width - 40; x += 54) {
        ctx.fillRect(x, 88, 28, 3);
    }

    Render.drawCar(
        ctx,
        {
            ...car,
            spd: 0,
            wheelspin: false,
            shiftJoltTimer: 0,
            boostPsi: 0,
            turboSpool: 0
        },
        canvas.width / 2,
        50,
        1
    );
}

function changeDealerCar(delta: number) {
    dealerChoiceIndex =
        (dealerChoiceIndex + delta + Dealer.carsForSale.length) %
        Dealer.carsForSale.length;

    syncDealerUI();
}

function syncEventUI() {
    const listings =
        document.getElementById("eventListings") as HTMLDivElement;

    if (!listings) return;

    const pageInfo =
        document.getElementById("eventPageInfo") as HTMLDivElement;

    const previousButton =
        document.getElementById("eventPrevBtn") as HTMLButtonElement;

    const nextButton =
        document.getElementById("eventNextBtn") as HTMLButtonElement;

    const totalPages =
        Math.max(1, Math.ceil(Events.list.length / eventsPerPage));

    eventPageIndex =
        Math.max(0, Math.min(eventPageIndex, totalPages - 1));

    const pageEvents =
        Events.list.slice(
            eventPageIndex * eventsPerPage,
            eventPageIndex * eventsPerPage + eventsPerPage
        );

    if (pageInfo) {
        pageInfo.innerText =
            `Page ${eventPageIndex + 1} / ${totalPages} | ` +
            `Events ${eventPageIndex * eventsPerPage + 1}-${eventPageIndex * eventsPerPage + pageEvents.length} of ${Events.list.length}`;
    }

    if (previousButton) {
        previousButton.disabled = eventPageIndex <= 0;
    }

    if (nextButton) {
        nextButton.disabled = eventPageIndex >= totalPages - 1;
    }

    listings.innerHTML =
        pageEvents.map(event => {
            const difficultyClass =
                event.difficulty.toLowerCase();

            const completed =
                Game.completedEvents?.[event.id] || 0;

            const payout =
                completed > 0
                    ? event.replayPayout
                    : event.payout;

            const rounds =
                event.rounds.map((round, index) => {
                    const previewCar =
                        Game.createOpponentCar(round.opponentBodyId);

                    const racerName =
                        round.racerName ||
                        "Random street racer";

                    return `
                        <div class="eventRound">
                            <span>
                                Race ${index + 1}: 
                                <span class="eventRoundName">${racerName}</span>
                            </span>
                            <span>${previewCar?.name || "Unknown"}</span>
                        </div>
                    `;
                }).join("");

            return `
                <div class="eventCard">
                    <div class="eventCardHeader">
                        <div class="eventName">${event.name}</div>
                        <div class="eventDifficulty ${difficultyClass}">
                            ${event.difficulty}
                        </div>
                    </div>
                    <div class="eventTag">${event.tag}</div>
                    <div class="eventSummary">${event.summary}</div>
                    <div class="eventRounds">${rounds}</div>
                    <div class="eventStatus">
                        Payout: $${payout}${completed > 0 ? " replay" : ""}
                    </div>
                    <button
                        class="eventStartBtn"
                        data-event-id="${event.id}"
                    >Start Event</button>
                </div>
            `;
        }).join("");

    listings.querySelectorAll(".eventStartBtn").forEach(button => {
        (button as HTMLButtonElement).onclick = () => {
            const eventId =
                (button as HTMLButtonElement).dataset.eventId || "";

            AudioSystem.init();
            Game.startEvent(eventId);
        };
    });
}

function changeEventPage(delta: number) {
    const totalPages =
        Math.max(1, Math.ceil(Events.list.length / eventsPerPage));

    eventPageIndex =
        Math.max(0, Math.min(eventPageIndex + delta, totalPages - 1));

    syncEventUI();
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
                <canvas
                    id="dealerIconCanvas"
                    class="dealerIconCanvas"
                    width="360"
                    height="116"
                ></canvas>
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
        markPurchaseButton(button);
        button.onclick = () => {
            Dealer.buyCar(Game, listing.bodyId);
            syncShopUI();
            syncDealerUI();
            syncGarageUI();
        };
    }

    listings.querySelector(".dealerCard")?.appendChild(button);
    listings.querySelector(".dealerCard")?.appendChild(testDriveButton);
    drawDealerIcon(previewCar);
    window.setTimeout(() => drawDealerIcon(previewCar), 120);
    window.setTimeout(() => drawDealerIcon(previewCar), 320);
}
const dealerPrevBtn =
    document.getElementById("dealerPrevBtn") as HTMLButtonElement;
const dealerNextBtn =
    document.getElementById("dealerNextBtn") as HTMLButtonElement;
const eventPrevBtn =
    document.getElementById("eventPrevBtn") as HTMLButtonElement;
const eventNextBtn =
    document.getElementById("eventNextBtn") as HTMLButtonElement;

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

if (eventPrevBtn) {
    eventPrevBtn.onclick = () => {
        changeEventPage(-1);
    };
}

if (eventNextBtn) {
    eventNextBtn.onclick = () => {
        changeEventPage(1);
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

function syncHeaderHUD() {
    const money =
        document.getElementById("money");

    if (money) {
        money.innerText = "$" + Game.money;
    }

    const raceMessage =
        document.getElementById("raceMessage");

    if (raceMessage) {
        raceMessage.innerText = Game.raceMessage || "";
    }
}

function formatPlayTime(seconds: number) {
    const totalSeconds =
        Math.max(0, Math.floor(seconds || 0));

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor((totalSeconds % 3600) / 60);

    const remainingSeconds =
        totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
}

function makeStatTile(label: string, value: string | number) {
    return `
        <div class="statTile">
            <div class="statLabel">${label}</div>
            <div class="statValue">${value}</div>
        </div>
    `;
}

function syncStatsUI() {
    const statsInfo =
        document.getElementById("statsInfo") as HTMLDivElement;

    if (!statsInfo) return;

    Game.stats =
        Game.normalizeStats(Game.stats);

    const mostUsedCarId =
        Game.getMostUsedCarId();

    const mostUsedCar =
        mostUsedCarId && Game.garageCars[mostUsedCarId]
            ? Game.garageCars[mostUsedCarId].name
            : "None yet";

    const mostUsedCount =
        mostUsedCarId
            ? Game.stats.carUses[mostUsedCarId] || 0
            : 0;

    const mostSuccessfulCarId =
        Game.getMostSuccessfulCarId();

    const mostSuccessfulCar =
        mostSuccessfulCarId && Game.garageCars[mostSuccessfulCarId]
            ? Game.garageCars[mostSuccessfulCarId].name
            : "None yet";

    const mostSuccessfulCount =
        mostSuccessfulCarId
            ? Game.stats.carWins[mostSuccessfulCarId] || 0
            : 0;

    const totalEvents =
        Events.list.length;

    const completedEventCount =
        Events.list.filter(event => (Game.completedEvents?.[event.id] || 0) > 0).length;

    const completionPercent =
        totalEvents > 0
            ? Math.floor((completedEventCount / totalEvents) * 100)
            : 0;

    statsInfo.innerHTML = `
        <div class="statsGrid">
            ${makeStatTile("Wins", Game.stats.wins)}
            ${makeStatTile("Losses", Game.stats.losses)}
            ${makeStatTile("Most Used Car", mostUsedCount > 0 ? `${mostUsedCar} (${mostUsedCount})` : mostUsedCar)}
            ${makeStatTile("Most Successful Car", mostSuccessfulCount > 0 ? `${mostSuccessfulCar} (${mostSuccessfulCount})` : mostSuccessfulCar)}
            ${makeStatTile("Events Completed", `${completedEventCount} / ${totalEvents}`)}
            ${makeStatTile("Total Completion", completionPercent + "%")}
            ${makeStatTile("Total Money Earned", "$" + Math.floor(Game.stats.totalMoneyEarned))}
            ${makeStatTile("Total Money Spent", "$" + Math.floor(Game.stats.totalMoneySpent))}
            ${makeStatTile("Total Playtime", formatPlayTime(Game.stats.totalPlayTime))}
        </div>
    `;
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
    (document.getElementById("menuAudioVolumeSlider") as HTMLInputElement).value = String(Math.round(Options.menuAudioVolume * 100));
    (document.getElementById("menuAudioVolumeValue") as HTMLSpanElement).innerText = Math.round(Options.menuAudioVolume * 100) + "%";
    (document.getElementById("opponentAudioVolumeSlider") as HTMLInputElement).value = String(Math.round(Options.opponentAudioVolume * 100));
    (document.getElementById("opponentAudioVolumeValue") as HTMLSpanElement).innerText = Math.round(Options.opponentAudioVolume * 100) + "%";
}

function applySaveData(save: any) {
    Game.money = save.money ?? 0;
    Game.stats = Game.normalizeStats(save.stats);
    Game.completedEvents = save.completedEvents || {};
    Game.ownedCars = save.ownedCars ?? ["maruMk5"];
    Game.garageCars = {
        maruMk5: Garage.getMaruMk5(),
        swagGG2: Garage.getSwagGG2(),
        swagLadybug2024: Garage.getSwagLadybug2024(),
        scholarVibratio: Garage.getScholarVibratio(),
        rouletteBlair: Garage.getRouletteBlair(),
        rouletteMontBlanc: Garage.getRouletteMontBlanc(),
        hannaCivilian: Garage.getHannaCivilian(),
        ...(save.garageCars ?? {})
    };
    migrateGarageGripRatings(Game.garageCars);
    migrateGarageTorqueCurves(Game.garageCars);
    migrateGarageBalanceDefaults(Game.garageCars);
    migrateGaragePowerAdderCurves(Game.garageCars);
    migrateGarageDragCoefficients(Game.garageCars);
    migrateGarageArchetypes(Game.garageCars);
    Game.playerCar = Game.garageCars[save.selectedCarId] || Game.garageCars.maruMk5 || Garage.getStarter();

    if (save.options) {
        Options.speedUnit = save.options.speedUnit ?? Options.speedUnit;
        Options.torqueUnit = save.options.torqueUnit ?? Options.torqueUnit;
        Options.weightUnit = save.options.weightUnit ?? Options.weightUnit;
        Options.lane = save.options.lane ?? Options.lane;
        Options.raceDirection = save.options.raceDirection ?? Options.raceDirection;
        Options.audioMuted = save.options.audioMuted ?? Options.audioMuted;
        Options.audioVolume = save.options.audioVolume ?? Options.audioVolume;
        Options.menuAudioVolume = save.options.menuAudioVolume ?? Options.menuAudioVolume;
        Options.opponentAudioVolume = save.options.opponentAudioVolume ?? Options.opponentAudioVolume;
        Options.boostUnit = save.options.boostUnit ?? Options.boostUnit;
    }

    updateOptionsUI();
    AudioSystem.applySettings();
    syncShopUI();
    syncDealerUI();
    syncGarageUI();
    syncStatsUI();
    syncEventUI();
    syncHeaderHUD();
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

    if (Game.runMode === "event") {
        Game.continueEvent();
    }
    else {
        Game.start(Game.runMode, Game.testDriveCar);
    }
};

(document.getElementById("backToGarageBtn") as HTMLButtonElement).onclick = () => {
    Game.raceStarted = false;
    Game.countdownActive = false;
    Game.raceFinished = true;
    Game.raceSummaryVisible = false;

    AudioSystem.stopAllEngines();
    Game.restoreTestDriveCar();
    Game.activeEventId = "";
    Game.eventRoundIndex = 0;
    Menu.showPanel("garagePanel");
};

migrateGarageGripRatings(Game.garageCars);
migrateGarageTorqueCurves(Game.garageCars);
migrateGarageBalanceDefaults(Game.garageCars);
migrateGaragePowerAdderCurves(Game.garageCars);
migrateGarageDragCoefficients(Game.garageCars);
migrateGarageArchetypes(Game.garageCars);

if (!Game.playerCar) {
    Game.playerCar = Garage.getStarter();
}

(document.getElementById("buyTires") as HTMLButtonElement).onclick = () => {
    Shop.buyTires(Game);
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

(document.getElementById("buyAero") as HTMLButtonElement).onclick = () => {
    Shop.buyAero(Game);
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

const menuAudioVolumeSlider =
    document.getElementById("menuAudioVolumeSlider") as HTMLInputElement;

const menuAudioVolumeValue =
    document.getElementById("menuAudioVolumeValue") as HTMLSpanElement;

const opponentAudioVolumeSlider =
    document.getElementById("opponentAudioVolumeSlider") as HTMLInputElement;

const opponentAudioVolumeValue =
    document.getElementById("opponentAudioVolumeValue") as HTMLSpanElement;

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

menuAudioVolumeSlider.oninput = () => {
    Options.menuAudioVolume =
        Number(menuAudioVolumeSlider.value) / 100;

    menuAudioVolumeValue.innerText =
        menuAudioVolumeSlider.value + "%";
};

opponentAudioVolumeSlider.oninput = () => {
    Options.opponentAudioVolume =
        Number(opponentAudioVolumeSlider.value) / 100;

    opponentAudioVolumeValue.innerText =
        opponentAudioVolumeSlider.value + "%";

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

(document.getElementById("decalColorPicker") as HTMLInputElement).oninput = () => {
    drawDecalPreview();
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
(window as any).syncEventUI = syncEventUI;
(window as any).syncGarageUI = syncGarageUI;
(window as any).syncShopUI = syncShopUI;
(window as any).syncStatsUI = syncStatsUI;

// Initialize systems
bindMenuSounds();
Menu.init();
syncOpponentSelector();
syncEventUI();
syncShopUI();
syncDealerUI();
syncGarageUI();
syncStatsUI();
selectSaveProfile(selectedSaveSlot);
Input.init(Game);
UI.init();
syncHeaderHUD();
