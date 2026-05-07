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
        document.getElementById("rpm").innerText =
            "RPM: " + Math.round(player.rpm);
        document.getElementById("speed").innerText =
            "Speed: " + Math.round(player.spd * 20) + " MPH";
        document.getElementById("gear").innerText =
            "Gear: " + player.gear;
        // ✅ ADD THIS
        this.drawTach(player, game);
    },
    triggerShiftFeedback(state) {
        this.shiftState = state;
        this.shiftTimer = 0.8;
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
        // ===== DRAW GAUGE BACKGROUND =====
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.stroke();
        // ===== DRAW CENTER CIRCLE =====
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        // ===== DRAW LAUNCH MESSAGE =====
        if (game.launchTriggered) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(game.launchState, centerX, centerY - 25);
        }
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
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1;
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
        // ===== DRAW RED NEEDLE =====
        const rpmRatio = Math.min(car.rpm / car.maxRPM, 1);
        const needleAngle = startAngle + rpmRatio * Math.PI;
        const needleLength = radius - 15;
        ctx.strokeStyle = "#ff3333";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(needleAngle) * needleLength, centerY + Math.sin(needleAngle) * needleLength);
        ctx.stroke();
        // ===== DRAW WHEELSPIN INDICATOR (ORANGE LIGHT) =====
        const wheelspinFlicker = car.wheelspin && Math.random() > 0.3;
        ctx.fillStyle = wheelspinFlicker ? "#ff9933" : "#333";
        ctx.beginPath();
        ctx.arc(centerX - 65, centerY - 40, 8, 0, Math.PI * 2);
        ctx.fill();
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
            const rpmRatio = car.rpm / car.maxRPM;
            if (rpmRatio < 0.75) {
                shiftLightColor = "#ffff33"; // Yellow - too early
            }
            else if (rpmRatio < 0.9) {
                shiftLightColor = "#ffff33"; // Yellow - good range
            }
            else if (rpmRatio < 0.97) {
                shiftLightColor = "#33ff33"; // Green - perfect range
            }
            else {
                shiftLightColor = "#ff3333"; // Red - too late
            }
        }
        ctx.fillStyle = shiftLightColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 10, 8, 0, Math.PI * 2);
        ctx.fill();
    },
    drawShiftIndicator(ctx, x, y) { },
    drawExtras(car) { }
};
