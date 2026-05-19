import { Options } from "./options.js";
import { speedToMph } from "./speed.js";
import { getShiftQuality, getShiftWindow } from "./power.js";
export const UI = {
    shiftState: "off",
    shiftMessage: "",
    shiftTimer: 0,
    shiftPromptKind: "",
    shiftLock: false,
    showCountdown(value) {
        const countdownEl = document.getElementById("countdown");
        if (countdownEl) {
            countdownEl.innerText = "";
        }
        if (value === "" || value === null || value === undefined) {
            if (this.shiftPromptKind === "countdown") {
                this.clearShiftPrompt();
            }
            return;
        }
        this.showShiftPrompt(String(value), value === "GO!" ? "perfect" : "countdown", 0.82, "countdown");
    },
    init() { },
    update(player, game) {
        const gameCanvas = document.getElementById("gameCanvas");
        const tachCanvas = document.getElementById("tachCanvas");
        const shouldShowRaceUI = game.countdownActive ||
            game.raceStarted ||
            game.raceSummaryVisible;
        if (gameCanvas) {
            gameCanvas.style.display =
                shouldShowRaceUI ? "block" : "none";
        }
        if (tachCanvas) {
            tachCanvas.style.display =
                shouldShowRaceUI ? "block" : "none";
        }
        const garageCanvas = document.getElementById("garageCanvas");
        if (garageCanvas) {
            const garagePanel = document.getElementById("garagePanel");
            const upgradePanel = document.getElementById("upgradePanel");
            const customizePanel = document.getElementById("customizePanel");
            const previewPanelOpen = (garagePanel && !garagePanel.classList.contains("hidden")) ||
                (upgradePanel && !upgradePanel.classList.contains("hidden")) ||
                (customizePanel && !customizePanel.classList.contains("hidden"));
            garageCanvas.style.display =
                previewPanelOpen &&
                    !game.countdownActive &&
                    !game.raceStarted &&
                    !game.raceSummaryVisible
                    ? "block"
                    : "none";
        }
        document.getElementById("raceMessage").innerText =
            game.raceMessage;
        let speedValue = speedToMph(player.spd);
        let speedLabel = "MPH";
        // ===== KM/H CONVERSION =====
        if (Options.speedUnit === "KMH") {
            speedValue *= 1.60934;
            speedLabel = "KM/H";
        }
        document.getElementById("money").innerText =
            "$" + game.money;
        // ===== SHOP BUTTON PRICE UPDATES =====
        document.getElementById("buyTires").innerText =
            "Buy Tires (+120 Grip) ($" + game.playerCar.tirePrice + ")";
        document.getElementById("buyTransmission").innerText =
            "Transmission Upgrade (+Top Speed) ($" + game.playerCar.transmissionPrice + ")";
        // ✅ ADD THIS
        this.drawTach(player, game);
        if (game.raceSummaryVisible) {
            this.updateRaceSummary(game);
        }
        else {
            const summary = document.getElementById("raceSummary");
            if (summary) {
                summary.classList.add("hidden");
                summary.style.display = "none";
            }
        }
    },
    clearShiftPrompt() {
        this.shiftTimer = 0;
        this.shiftPromptKind = "";
        const shiftMsg = document.getElementById("shiftMsg");
        if (shiftMsg) {
            shiftMsg.innerText = "";
            shiftMsg.classList.remove("perfect", "good", "bad", "active", "countdown");
        }
    },
    showShiftPrompt(message, tone, duration, kind) {
        this.shiftState = tone;
        this.shiftTimer = duration;
        this.shiftPromptKind = kind;
        const shiftMsg = document.getElementById("shiftMsg");
        if (!shiftMsg)
            return;
        shiftMsg.innerText = message;
        shiftMsg.classList.remove("perfect", "good", "bad", "active", "countdown");
        shiftMsg.classList.add("active");
        if (tone === "perfect") {
            shiftMsg.style.color = "#33ff33";
            shiftMsg.classList.add("perfect");
        }
        else if (tone === "good") {
            shiftMsg.style.color = "#ffff33";
            shiftMsg.classList.add("good");
        }
        else if (tone === "countdown") {
            shiftMsg.style.color = "#ffffff";
            shiftMsg.classList.add("countdown");
        }
        else {
            shiftMsg.style.color = "#ff3333";
            shiftMsg.classList.add("bad");
        }
    },
    triggerShiftFeedback(state) {
        if (state === "PERFECT") {
            this.showShiftPrompt(state, "perfect", 0.8, "shift");
        }
        else if (state === "GOOD") {
            this.showShiftPrompt(state, "good", 0.8, "shift");
        }
        else {
            this.showShiftPrompt(state, "bad", 0.8, "shift");
        }
    },
    triggerLaunchFeedback(state) {
        let tone = "bad";
        if (state === "Perfect Launch") {
            tone = "perfect";
        }
        else if (state === "Good Launch") {
            tone = "good";
        }
        this.showShiftPrompt(state, tone, 1.45, "launch");
    },
    drawTach(car, game) {
        const canvas = document.getElementById("tachCanvas");
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        // ===== TACHOMETER CENTER & DIMENSIONS =====
        const centerX = width / 2;
        const centerY = height * 0.7;
        const radius = 70;
        const startAngle = Math.PI; // 180 degrees (left)
        const endAngle = 0; // 0 degrees (right)
        // ===== DRAW GAUGE FACE =====
        ctx.fillStyle = "#151515";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 18, Math.PI, 0);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.fill();
        // ===== DRAW OUTER GAUGE RING =====
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.stroke();
        // ===== DRAW INNER GAUGE RING =====
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 14, startAngle, endAngle);
        ctx.stroke();
        // ===== DRAW CENTER HUB =====
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();
        // ===== DRAW POWERBAND ZONES =====
        const shiftWindow = getShiftWindow(car);
        const powerbandStartRatio = shiftWindow.goodStart / car.maxRPM;
        const perfectStartRatio = shiftWindow.perfectStart / car.maxRPM;
        const powerbandEndRatio = shiftWindow.perfectEnd / car.maxRPM;
        const powerbandStartAngle = startAngle + powerbandStartRatio * Math.PI;
        const perfectStartAngle = startAngle + perfectStartRatio * Math.PI;
        const powerbandEndAngle = startAngle + powerbandEndRatio * Math.PI;
        // GOOD ZONE
        ctx.strokeStyle = "#f1db10";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8, powerbandStartAngle, perfectStartAngle);
        ctx.stroke();
        // PERFECT ZONE
        ctx.strokeStyle = "#44f318";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8, perfectStartAngle, powerbandEndAngle);
        ctx.stroke();
        // REDLINE ZONE
        ctx.strokeStyle = "#c50808";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8, powerbandEndAngle, endAngle);
        ctx.stroke();
        // ===== DRAW RPM MARKERS & NUMBERS =====
        ctx.fillStyle = car.tachTextColor || "#ffffff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Small ticks every 500 RPM
        for (let rpm = 500; rpm <= car.maxRPM; rpm += 500) {
            const ratio = rpm / car.maxRPM;
            const angle = startAngle + ratio * Math.PI;
            const isMajorTick = rpm % 1000 === 0;
            ctx.strokeStyle = rpm >= shiftWindow.perfectEnd ? "#ff3333" : "#aaa";
            ctx.lineWidth = isMajorTick ? 2 : 1;
            const tickStart = isMajorTick ? radius - 11 : radius - 6;
            const tickEnd = radius + 3;
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(angle) * tickStart, centerY + Math.sin(angle) * tickStart);
            ctx.lineTo(centerX + Math.cos(angle) * tickEnd, centerY + Math.sin(angle) * tickEnd);
            ctx.stroke();
        }
        // Numbers every 1000 RPM
        for (let rpm = 1000; rpm <= car.maxRPM; rpm += 1000) {
            const ratio = rpm / car.maxRPM;
            const angle = startAngle + ratio * Math.PI;
            const number = rpm / 1000;
            ctx.fillStyle = rpm >= shiftWindow.perfectEnd
                ? "#ff6666"
                : (car.tachTextColor || "#ffffff");
            ctx.fillText(number.toString(), centerX + Math.cos(angle) * (radius + 19), centerY + Math.sin(angle) * (radius + 19));
        }
        // Show exact max RPM if not cleanly divisible
        if (car.maxRPM % 1000 !== 0) {
            const angle = endAngle;
            const number = (car.maxRPM / 1000).toFixed(1);
            ctx.fillStyle = "#ff6666";
            ctx.fillText(number, centerX + Math.cos(angle) * (radius + 19), centerY + Math.sin(angle) * (radius + 19));
        }
        // ===== SHIFT FEEDBACK TIMER =====
        if (this.shiftTimer > 0) {
            this.shiftTimer -= 0.016;
            if (this.shiftTimer <= 0) {
                this.shiftTimer = 0;
                const shiftMsg = document.getElementById("shiftMsg");
                if (shiftMsg) {
                    shiftMsg.innerText = "";
                    shiftMsg.classList.remove("perfect", "good", "bad", "active", "countdown");
                }
                this.shiftPromptKind = "";
            }
        }
        // ===== RPM RATIO =====
        const rpmRatio = Math.min(car.rpm / car.maxRPM, 1);
        // ===== DRAW SHIFT INDICATOR LIGHT =====
        let shiftLightColor = "#333";
        if (this.shiftTimer > 0) {
            // Shift feedback active
            if (this.shiftState === "PERFECT") {
                shiftLightColor = "#33ff33"; // Green
            }
            else if (this.shiftState === "GOOD") {
                shiftLightColor = "#ffff33"; // Yellow
            }
            else if (this.shiftState === "EARLY" || this.shiftState === "LATE") {
                shiftLightColor = "#ff3333"; // Red
            }
        }
        else {
            // Show current shift quality indicator
            const liveShiftQuality = getShiftQuality(car, car.rpm);
            if (liveShiftQuality === "EARLY") {
                // EARLY
                shiftLightColor = "#111";
            }
            else if (liveShiftQuality === "GOOD") {
                // GOOD
                shiftLightColor = "#f1d012";
            }
            else if (liveShiftQuality === "PERFECT") {
                // PERFECT
                shiftLightColor = "#55f317";
            }
            else {
                // LATE
                shiftLightColor = "#fd3e1c";
            }
        }
        ctx.fillStyle = shiftLightColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 38, 8, 0, Math.PI * 2);
        ctx.fill();
        // ===== DRAW NEEDLE =====
        const needleAngle = startAngle + rpmRatio * Math.PI;
        const needleLength = radius - 8;
        const needleColor = car.needleColor || "#ff3333";
        // Needle shadow
        ctx.strokeStyle = "#330000";
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(needleAngle) * needleLength, centerY + Math.sin(needleAngle) * needleLength);
        ctx.stroke();
        // Main needle
        ctx.strokeStyle = needleColor;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(needleAngle) * needleLength, centerY + Math.sin(needleAngle) * needleLength);
        ctx.stroke();
        // Needle hub overlay
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = car.hubColor || "#ff3333";
        ctx.lineWidth = 2;
        ctx.stroke();
        // ===== DRAW LARGE CURRENT GEAR =====
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(car.gear.toString(), centerX, centerY + 32);
        // ===== DRAW SPEED INSIDE TACH =====
        let tachSpeed = speedToMph(car.spd);
        let tachLabel = "MPH";
        if (Options.speedUnit === "KMH") {
            tachSpeed *= 1.60934;
            tachLabel = "KM/H";
        }
        ctx.fillStyle = car.tachTextColor || "#ffffff";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(Math.round(tachSpeed) + " " + tachLabel, centerX, centerY + 15);
        // ===== DRAW SHIFT LIGHT LABEL =====
        ctx.fillStyle = "#aaa";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SHIFT", centerX, centerY - 55);
        // ===== DRAW WHEELSPIN INDICATOR (ORANGE LIGHT) =====
        const wheelspinFlicker = car.wheelspin && Math.random() > 0.3;
        ctx.fillStyle = wheelspinFlicker ? "#ff9933" : "#333";
        ctx.beginPath();
        ctx.arc(centerX - 105, centerY + 0, 8, 0, Math.PI * 2);
        ctx.fill();
        // ===== TRACTION CONTROL ICON =====
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("!", centerX - 105, centerY + 1);
        // ===== LABEL =====
        ctx.fillStyle = "#aaa";
        ctx.font = "bold 9px Arial";
        ctx.fillText("SPIN", centerX - 105, centerY + 18);
        // ===== BOOST GAUGE =====
        const hasBoostGauge = car.forcedInductionType === "turbo" ||
            car.forcedInductionType === "supercharger";
        if (!hasBoostGauge) {
            return;
        }
        const boostPsi = Math.max(0, car.boostPsi || 0);
        const hasBoost = boostPsi > 0.05;
        const boostX = centerX + 112;
        const boostY = centerY - 100;
        const boostRadius = 24;
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(boostX, boostY, boostRadius, 0, Math.PI * 2);
        ctx.stroke();
        const boostMaxPsi = 18;
        const boostMajorStep = Options.boostUnit === "BAR"
            ? 0.5 / 0.0689476
            : 5;
        const boostMinorStep = Options.boostUnit === "BAR"
            ? 0.25 / 0.0689476
            : 2.5;
        for (let markPsi = 0; markPsi <= boostMaxPsi + 0.01; markPsi += boostMinorStep) {
            const markRatio = Math.min(markPsi / boostMaxPsi, 1);
            const markAngle = -Math.PI / 2 + markRatio * Math.PI * 2;
            const isMajorMark = Math.abs(markPsi / boostMajorStep - Math.round(markPsi / boostMajorStep)) < 0.04;
            const innerRadius = boostRadius - (isMajorMark ? 8 : 5);
            const outerRadius = boostRadius - 1;
            ctx.strokeStyle =
                isMajorMark ? "#d8d8d8" : "#777";
            ctx.lineWidth =
                isMajorMark ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(boostX + Math.cos(markAngle) * innerRadius, boostY + Math.sin(markAngle) * innerRadius);
            ctx.lineTo(boostX + Math.cos(markAngle) * outerRadius, boostY + Math.sin(markAngle) * outerRadius);
            ctx.stroke();
        }
        const boostRatio = Math.min(boostPsi / boostMaxPsi, 1);
        const boostAngle = -Math.PI / 2 + boostRatio * Math.PI * 2;
        ctx.strokeStyle = hasBoost ? "#33ccff" : "#333";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(boostX, boostY, boostRadius - 5, -Math.PI / 2, boostAngle);
        ctx.stroke();
        ctx.strokeStyle = hasBoost ? "#f5f5f5" : "#555";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boostX, boostY);
        ctx.lineTo(boostX + Math.cos(boostAngle) * (boostRadius - 7), boostY + Math.sin(boostAngle) * (boostRadius - 7));
        ctx.stroke();
        const boostValue = Options.boostUnit === "BAR"
            ? boostPsi * 0.0689476
            : boostPsi;
        ctx.fillStyle = "#ddd";
        ctx.font = "bold 8px Arial";
        ctx.textAlign = "center";
        ctx.fillText(Options.boostUnit === "BAR"
            ? boostValue.toFixed(1)
            : Math.round(boostValue).toString(), boostX, boostY + 4);
        ctx.fillText(Options.boostUnit, boostX, boostY + 17);
    },
    drawShiftIndicator(ctx, x, y) { },
    updateRaceSummary(game) {
        var _a, _b;
        const summary = document.getElementById("raceSummary");
        const title = document.getElementById("summaryTitle");
        const playerTime = document.getElementById("summaryPlayerTime");
        const aiTime = document.getElementById("summaryAiTime");
        const reward = document.getElementById("summaryReward");
        const difference = document.getElementById("summaryDifference");
        const raceAgainButton = document.getElementById("raceAgainBtn");
        const playerWon = game.runMode === "event"
            ? !!game.currentEventRoundWon
            : game.raceReward === 100;
        summary.classList.remove("hidden");
        summary.style.display = "block";
        if (raceAgainButton) {
            raceAgainButton.innerText = "Race Again?";
        }
        if (game.runMode === "practice" || game.runMode === "testDrive") {
            const runLabel = game.runMode === "testDrive"
                ? "Test Drive"
                : "Practice";
            const bestKey = game.playerCar.bodyId + ":" + game.trackLength;
            const bestTime = game.practiceBestTimes
                ? game.practiceBestTimes[bestKey]
                : 0;
            title.innerText = runLabel + " Complete";
            playerTime.innerText =
                "Time: " +
                    (game.playerFinishTime > 0 ? game.playerFinishTime.toFixed(2) + "s" : "DNF");
            aiTime.innerText =
                "Car: " + (game.runCarName || game.playerCar.name);
            difference.innerText =
                bestTime > 0
                    ? "Best: " + bestTime.toFixed(2) + "s"
                    : "Best: --";
            reward.innerText =
                "No cash earned in " + runLabel + ".";
            return;
        }
        if (game.runMode === "event") {
            const event = game.getActiveEvent ? game.getActiveEvent() : null;
            const roundNumber = (game.eventRoundIndex || 0) + 1;
            const totalRounds = ((_a = event === null || event === void 0 ? void 0 : event.rounds) === null || _a === void 0 ? void 0 : _a.length) || roundNumber;
            title.innerText =
                playerWon
                    ? roundNumber >= totalRounds
                        ? "Event Complete!"
                        : "Event Round Won!"
                    : "Event Round Lost";
            aiTime.innerText =
                "Opponent: " +
                    (game.currentOpponentName || "Unknown") +
                    " | Time: " +
                    (game.aiFinishTime > 0
                        ? game.aiFinishTime.toFixed(2) + "s"
                        : game.playerFinishTime > 0
                            ? "Still racing"
                            : "DNF");
        }
        else {
            title.innerText = playerWon ? "Victory!" : "Defeat";
            aiTime.innerText =
                "Opponent Time: " +
                    (game.aiFinishTime > 0
                        ? game.aiFinishTime.toFixed(2) + "s"
                        : game.playerFinishTime > 0
                            ? "Still racing"
                            : "DNF");
        }
        playerTime.innerText =
            "Player Time: " +
                (game.playerFinishTime > 0 ? game.playerFinishTime.toFixed(2) + "s" : "DNF");
        if (game.playerFinishTime > 0 && game.aiFinishTime > 0) {
            const gap = Math.abs(game.playerFinishTime - game.aiFinishTime);
            difference.innerText =
                game.playerFinishTime <= game.aiFinishTime
                    ? "Difference: Won by " + gap.toFixed(2) + "s"
                    : "Difference: Lost by " + gap.toFixed(2) + "s";
        }
        else if (game.playerFinishTime > 0 && game.aiFinishTime <= 0) {
            const liveLead = Math.max(0, game.raceTime - game.playerFinishTime);
            difference.innerText =
                liveLead > 0
                    ? "Difference: Winning by at least " + liveLead.toFixed(2) + "s"
                    : "Difference: Opponent still racing...";
        }
        else if (game.aiFinishTime > 0 && game.playerFinishTime <= 0) {
            difference.innerText =
                "Difference: Opponent finished first";
        }
        else {
            difference.innerText =
                "Difference: Waiting...";
        }
        if (game.runMode === "event") {
            const event = game.getActiveEvent ? game.getActiveEvent() : null;
            const roundNumber = (game.eventRoundIndex || 0) + 1;
            const totalRounds = ((_b = event === null || event === void 0 ? void 0 : event.rounds) === null || _b === void 0 ? void 0 : _b.length) || roundNumber;
            reward.innerText =
                "Event: " + ((event === null || event === void 0 ? void 0 : event.name) || "Event") + "\n" +
                    "Round: " + roundNumber + " / " + totalRounds + "\n" +
                    "Event Payout: +$" + game.totalReward + "\n" +
                    "Launch Bonus: held until event completion";
            if (raceAgainButton) {
                raceAgainButton.innerText =
                    playerWon && roundNumber < totalRounds
                        ? "Next Race"
                        : playerWon
                            ? "Finish Event"
                            : "Retry Race";
            }
        }
        else {
            reward.innerText =
                "Race Reward: +$" + game.raceReward + "\n" +
                    "Launch Bonus: +$" + game.bonusReward + "\n" +
                    "Difficulty Multiplier: x" + game.difficultyMultiplier + "\n" +
                    "Distance Multiplier: x" + game.distanceMultiplier + "\n" +
                    "Total Cash Earned: +$" + game.totalReward;
        }
    },
    drawExtras(car) { }
};
