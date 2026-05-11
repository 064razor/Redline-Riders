import { Options } from "./options.js";
export const UI = {
    shiftState: "off",
    shiftMessage: "",
    shiftTimer: 0,
    shiftLock: false,
    showCountdown(value) {
        const countdownEl = document.getElementById("countdown");
        if (countdownEl) {
            countdownEl.innerText = value;
        }
    },
    init() { },
    update(player, game) {
        document.getElementById("raceMessage").innerText =
            game.raceMessage;
        let speedValue = player.spd * 20;
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
            "Buy Tires (+1 Grip) ($" + game.playerCar.tirePrice + ")";
        document.getElementById("buyEngine").innerText =
            "Buy Engine (+25 HP) ($" + game.playerCar.enginePrice + ")";
        document.getElementById("buyTransmission").innerText =
            "Transmission Upgrade (+Top Speed) ($" + game.playerCar.transmissionPrice + ")";
        // ✅ ADD THIS
        this.drawTach(player, game);
        this.updateRaceSummary(game);
    },
    triggerShiftFeedback(state) {
        this.shiftState = state;
        this.shiftTimer = 0.8;
        const shiftMsg = document.getElementById("shiftMsg");
        if (shiftMsg) {
            shiftMsg.innerText = state;
            // Optional colors for readability
            if (state === "PERFECT") {
                shiftMsg.style.color = "#33ff33";
            }
            else if (state === "GOOD") {
                shiftMsg.style.color = "#ffff33";
            }
            else {
                shiftMsg.style.color = "#ff3333";
            }
        }
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
        // ===== DRAW LAUNCH MESSAGE =====
        if (game.launchTriggered) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(game.launchState, centerX, centerY - 25);
        }
        // ===== DRAW POWERBAND ZONES =====
        const powerbandStartRatio = car.powerbandMin / car.maxRPM;
        const perfectStartRatio = (car.powerbandMax * 0.92) / car.maxRPM;
        const powerbandEndRatio = car.powerbandMax / car.maxRPM;
        const powerbandStartAngle = startAngle + powerbandStartRatio * Math.PI;
        const perfectStartAngle = startAngle + perfectStartRatio * Math.PI;
        const powerbandEndAngle = startAngle + powerbandEndRatio * Math.PI;
        // GOOD ZONE
        ctx.strokeStyle = "#ffff33";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8, powerbandStartAngle, perfectStartAngle);
        ctx.stroke();
        // PERFECT ZONE
        ctx.strokeStyle = "#33ff33";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8, perfectStartAngle, powerbandEndAngle);
        ctx.stroke();
        // REDLINE ZONE
        ctx.strokeStyle = "#ff3333";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8, powerbandEndAngle, endAngle);
        ctx.stroke();
        // ===== DRAW GEAR MARKERS & NUMBERS =====
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let gear = 1; gear <= 7; gear++) {
            const angle = startAngle + (gear - 1) * (Math.PI / 6); // 7 gears across 180 degrees
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            // Draw tick mark
            ctx.strokeStyle = "#aaa";
            ctx.lineWidth = gear === car.gear ? 3 : 1;
            ctx.beginPath();
            const tickStart = radius - 8;
            const tickEnd = radius + 3;
            ctx.moveTo(centerX + Math.cos(angle) * tickStart, centerY + Math.sin(angle) * tickStart);
            ctx.lineTo(centerX + Math.cos(angle) * tickEnd, centerY + Math.sin(angle) * tickEnd);
            ctx.stroke();
            // Draw number
            ctx.fillStyle = "#fff";
            const numX = centerX + Math.cos(angle) * (radius + 18);
            const numY = centerY + Math.sin(angle) * (radius + 18);
            ctx.fillText(gear.toString(), numX, numY);
        }
        // ===== SHIFT FEEDBACK TIMER =====
        if (this.shiftTimer > 0) {
            this.shiftTimer -= 0.016;
            if (this.shiftTimer <= 0) {
                this.shiftTimer = 0;
                const shiftMsg = document.getElementById("shiftMsg");
                if (shiftMsg) {
                    shiftMsg.innerText = "";
                }
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
            if (car.rpm < car.powerbandMin) {
                // EARLY
                shiftLightColor = "#111";
            }
            else if (car.rpm < car.powerbandMax * 0.92) {
                // GOOD
                shiftLightColor = "#ffff33";
            }
            else if (car.rpm <= car.powerbandMax) {
                // PERFECT
                shiftLightColor = "#33ff33";
            }
            else {
                // LATE
                shiftLightColor = "#ff3333";
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
        let tachSpeed = car.spd * 20;
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
    },
    drawShiftIndicator(ctx, x, y) { },
    updateRaceSummary(game) {
        const panel = document.getElementById("raceSummary");
        if (!panel)
            return;
        if (!game.raceSummaryVisible) {
            panel.style.display = "none";
            return;
        }
        panel.style.display = "block";
        const title = document.getElementById("summaryTitle");
        const playerTime = document.getElementById("summaryPlayerTime");
        const aiTime = document.getElementById("summaryAiTime");
        const reward = document.getElementById("summaryReward");
        const difference = document.getElementById("summaryDifference");
        const playerWon = game.playerFinishTime > 0 &&
            game.aiFinishTime > 0 &&
            game.playerFinishTime <= game.aiFinishTime;
        title.innerText = playerWon ? "Victory!" : "Defeat";
        playerTime.innerText =
            "Player Time: " +
                (game.playerFinishTime > 0 ? game.playerFinishTime.toFixed(2) + "s" : "DNF");
        aiTime.innerText =
            "Opponent Time: " +
                (game.aiFinishTime > 0 ? game.aiFinishTime.toFixed(2) + "s" : "DNF");
        difference.innerText =
            playerWon
                ? "Difference: Finished ahead"
                : "Difference: Opponent finished first";
        reward.innerText =
            "Reward: +$" + game.raceReward +
                " | Bonus: +$" + game.bonusReward +
                " | Total: +$" + (game.raceReward + game.bonusReward);
    },
    drawExtras(car) { }
};
