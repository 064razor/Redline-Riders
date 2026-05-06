console.log("ui loaded");

const UI = {

    // ===== SHIFT STATE =====
    shiftState: "off", // "off", "early", "good", "perfect", "late"
    shiftMessage: "",
    shiftTimer: 0,
    shiftLock: false, // prevents spam

    init() {},

    update(player, game) {

        // ===== TEXT UI =====
        document.getElementById("rpm").innerText =
            "RPM: " + Math.round(player.rpm);

        document.getElementById("speed").innerText =
            "Speed: " + Math.round(player.spd * 20) + " MPH";

        document.getElementById("gear").innerText =
            "Gear: " + player.gear;

        // ===== AUTO SHIFT DETECTION =====
        const rpmRatio = player.rpm / player.maxRPM;

        if (!this.shiftLock) {

            if (rpmRatio >= 1.0) {
                this.triggerShiftFeedback("late");
                this.shiftLock = true;
            }
            else if (rpmRatio > 0.92) {
                this.triggerShiftFeedback("perfect");
                this.shiftLock = true;
            }
            else if (rpmRatio > 0.85) {
                this.triggerShiftFeedback("good");
                this.shiftLock = true;
            }
            else if (rpmRatio > 0.7) {
                this.triggerShiftFeedback("early");
                this.shiftLock = true;
            }
        }

        // Reset lock when RPM drops (after shift)
        if (rpmRatio < 0.6) {
            this.shiftLock = false;
        }

        // ===== FADE TIMER =====
        if (this.shiftTimer > 0) {
            this.shiftTimer -= 0.016;
        } else {
            this.shiftState = "off";
            this.shiftMessage = "";
        }
    },

    triggerShiftFeedback(state) {
        this.shiftState = state;
        this.shiftTimer = 0.8;

        switch (state) {
            case "early":
                this.shiftMessage = "EARLY";
                break;
            case "good":
                this.shiftMessage = "GOOD";
                break;
            case "perfect":
                this.shiftMessage = "PERFECT";
                break;
            case "late":
                this.shiftMessage = "LATE";
                break;
            default:
                this.shiftMessage = "";
        }
    },

    // ===== TACHOMETER =====
    drawTach(car) {

        const canvas = document.getElementById("tachCanvas");
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = 150;
        const centerY = 150;
        const radius = 80;

        // ARC
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.stroke();

        // TICKS
        for (let i = 0; i <= 35; i++) {
            let ratio = i / 35;
            let angle = Math.PI + ratio * Math.PI;

            let outerX = centerX + Math.cos(angle) * radius;
            let outerY = centerY + Math.sin(angle) * radius;

            let innerRadius = (i % 5 === 0) ? 65 : 72;

            let innerX = centerX + Math.cos(angle) * innerRadius;
            let innerY = centerY + Math.sin(angle) * innerRadius;

            ctx.beginPath();
            ctx.moveTo(innerX, innerY);
            ctx.lineTo(outerX, outerY);
            ctx.stroke();
        }

        // NUMBERS
        ctx.fillStyle = "white";
        ctx.font = "12px Orbitron";
        ctx.textAlign = "center";

        for (let i = 0; i <= 7; i++) {
            let ratio = i / 7;
            let angle = Math.PI + ratio * Math.PI;

            let x = centerX + Math.cos(angle) * 95;
            let y = centerY + Math.sin(angle) * 95;

            ctx.fillText(i.toString(), x, y);
        }

        // NEEDLE
        let r = car.rpm / car.maxRPM;
        r = Math.max(0, Math.min(1, r));

        let angle = Math.PI + r * Math.PI;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * 70,
            centerY + Math.sin(angle) * 70
        );

        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.stroke();

        // ===== SHIFT INDICATOR (GUARANTEED DRAW) =====
        this.drawShiftIndicator(ctx, centerX, centerY);
    },

    // ===== SHIFT INDICATOR =====
    drawShiftIndicator(ctx, centerX, centerY) {

        if (this.shiftState === "off") return;

        const time = Date.now();

        const x = centerX;
        const y = centerY - 60 + Math.sin(time * 0.01) * 2;

        let color = "white";
        let glow = 0;

        switch (this.shiftState) {
            case "early":
                color = "yellow";
                glow = 10;
                break;
            case "good":
                color = "orange";
                glow = 12;
                break;
            case "perfect":
                color = "lime";
                glow = 18;
                break;
            case "late":
                color = "red";
                glow = 14;
                break;
        }

        const pulse = Math.sin(time * 0.02) * 2;

        ctx.save();

        ctx.globalAlpha = Math.max(0, this.shiftTimer);

        ctx.shadowColor = color;
        ctx.shadowBlur = glow + pulse;

        // circle
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();

        // text
        ctx.fillStyle = "white";
        ctx.font = "10px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText(this.shiftMessage, x, y - 14);
    },

    // ===== WHEELSPIN ICON =====
    drawExtras(car) {

        const canvas = document.getElementById("tachCanvas");
        const ctx = canvas.getContext("2d");

        const centerX = 150;
        const centerY = 150;

        if (!car.wheelspin) return;

        const angle = Math.PI;
        const radius = 95;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        let intensity = Math.min(1, car.spd / 50);
        let flicker = (Math.random() * 0.5 + 0.75) * intensity;

        ctx.shadowBlur = 20 * flicker;
        ctx.shadowColor = "orange";

        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "orange";
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("!", x, y + 4);

        ctx.shadowBlur = 0;
    }
};