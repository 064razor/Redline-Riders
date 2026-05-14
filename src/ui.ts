import { Options } from "./options.js";
export const UI = {
    shiftState: "off",
    shiftMessage: "",
    shiftTimer: 0,
    shiftLock: false,

    showCountdown(value: any) {
        const countdownEl = document.getElementById("countdown");
        if (countdownEl) {
            countdownEl.innerText = value;
        }
    },

    init() {},

    update(player: any, game: any) {
		
		document.getElementById("raceMessage")!.innerText =
        game.raceMessage;
		
        let speedValue = player.spd * 20;
        let speedLabel = "MPH";

        // ===== KM/H CONVERSION =====
        if (Options.speedUnit === "KMH") {

            speedValue *= 1.60934;
            speedLabel = "KM/H";
        }
			
		document.getElementById("money")!.innerText =
            "$" + game.money;
			
			// ===== SHOP BUTTON PRICE UPDATES =====
        (document.getElementById("buyTires") as HTMLButtonElement).innerText =
        "Buy Tires (+1 Grip) ($" + game.playerCar.tirePrice + ")";

        (document.getElementById("buyEngine") as HTMLButtonElement).innerText =
        "Buy Engine (+25 HP) ($" + game.playerCar.enginePrice + ")";
		
		(document.getElementById("buyTransmission") as HTMLButtonElement).innerText =
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

    triggerShiftFeedback(state: any) {

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

    drawTach(car: any, game: any) {
        const canvas = document.getElementById("tachCanvas") as HTMLCanvasElement;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d")!;
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

             ctx.fillText(
                 game.launchState,
                 centerX,
                 centerY - 25
             );
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
        ctx.arc(
            centerX,
            centerY,
            radius + 8,
            powerbandStartAngle,
            perfectStartAngle
        );
        ctx.stroke();

        // PERFECT ZONE
        ctx.strokeStyle = "#33ff33";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(
            centerX,
            centerY,
            radius + 8,
            perfectStartAngle,
            powerbandEndAngle
        );
        ctx.stroke();

        // REDLINE ZONE
        ctx.strokeStyle = "#ff3333";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(
            centerX,
            centerY,
            radius + 8,
            powerbandEndAngle,
            endAngle
        );
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

        ctx.strokeStyle = rpm >= car.powerbandMax ? "#ff3333" : "#aaa";
        ctx.lineWidth = isMajorTick ? 2 : 1;

    const tickStart = isMajorTick ? radius - 11 : radius - 6;
    const tickEnd = radius + 3;

    ctx.beginPath();
    ctx.moveTo(
        centerX + Math.cos(angle) * tickStart,
        centerY + Math.sin(angle) * tickStart
    );
    ctx.lineTo(
        centerX + Math.cos(angle) * tickEnd,
        centerY + Math.sin(angle) * tickEnd
    );
    ctx.stroke();
}

// Numbers every 1000 RPM
for (let rpm = 1000; rpm <= car.maxRPM; rpm += 1000) {
    const ratio = rpm / car.maxRPM;
    const angle = startAngle + ratio * Math.PI;
    const number = rpm / 1000;

    ctx.fillStyle = rpm >= car.powerbandMax
        ? "#ff6666"
        : (car.tachTextColor || "#ffffff");

    ctx.fillText(
        number.toString(),
        centerX + Math.cos(angle) * (radius + 19),
        centerY + Math.sin(angle) * (radius + 19)
    );
}

// Show exact max RPM if not cleanly divisible
if (car.maxRPM % 1000 !== 0) {
    const angle = endAngle;
    const number = (car.maxRPM / 1000).toFixed(1);

    ctx.fillStyle = "#ff6666";

    ctx.fillText(
        number,
        centerX + Math.cos(angle) * (radius + 19),
        centerY + Math.sin(angle) * (radius + 19)
    );
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
            } else if (this.shiftState === "GOOD") {
                shiftLightColor = "#ffff33"; // Yellow
            } else if (this.shiftState === "EARLY" || this.shiftState === "LATE") {
                shiftLightColor = "#ff3333"; // Red
            }
        } else {
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
        ctx.lineTo(
            centerX + Math.cos(needleAngle) * needleLength,
            centerY + Math.sin(needleAngle) * needleLength
        );
        ctx.stroke();

        // Main needle
        ctx.strokeStyle = needleColor;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(needleAngle) * needleLength,
            centerY + Math.sin(needleAngle) * needleLength
        );
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

        ctx.fillText(
            car.gear.toString(),
            centerX,
            centerY + 32
        );
		
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

            ctx.fillText(
            Math.round(tachSpeed) + " " + tachLabel,
            centerX,
            centerY + 15
        );

		
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

        ctx.fillText(
            "!",
            centerX - 105,
            centerY + 1
        );

        // ===== LABEL =====
        ctx.fillStyle = "#aaa";
        ctx.font = "bold 9px Arial";

        ctx.fillText(
            "SPIN",
            centerX - 105,
            centerY + 18
        );
    },

    drawShiftIndicator(ctx: any, x: any, y: any) {},
	
	updateRaceSummary(game: any) {

    const summary = document.getElementById("raceSummary")!;
    const title = document.getElementById("summaryTitle")!;
    const playerTime = document.getElementById("summaryPlayerTime")!;
    const aiTime = document.getElementById("summaryAiTime")!;
	const reward = document.getElementById("summaryReward")!;
    const difference = document.getElementById("summaryDifference")!;
	const playerWon =
		game.raceReward === 100;
		
		summary.classList.remove("hidden");
        summary.style.display = "block";

    title.innerText = playerWon ? "Victory!" : "Defeat";

    playerTime.innerText =
        "Player Time: " +
        (game.playerFinishTime > 0 ? game.playerFinishTime.toFixed(2) + "s" : "DNF");

    aiTime.innerText =
        "Opponent Time: " +
        (game.aiFinishTime > 0 ? game.aiFinishTime.toFixed(2) + "s" : "DNF");
	
			if (game.playerFinishTime > 0 && game.aiFinishTime > 0) {

			const gap =
				Math.abs(game.playerFinishTime - game.aiFinishTime);

			difference.innerText =
				game.playerFinishTime <= game.aiFinishTime
					? "Difference: Won by " + gap.toFixed(2) + "s"
					: "Difference: Lost by " + gap.toFixed(2) + "s";
		}
		else if (game.playerFinishTime > 0 && game.aiFinishTime <= 0) {

			difference.innerText =
				"Difference: Opponent still racing...";
		}
		else if (game.aiFinishTime > 0 && game.playerFinishTime <= 0) {

			difference.innerText =
				"Difference: Opponent finished first";
		}
		else {

			difference.innerText =
				"Difference: Waiting...";
		}
		
    reward.innerText =
    "Race Reward: +$" + game.raceReward + "\n" +
    "Launch Bonus: +$" + game.bonusReward + "\n" +
    "Difficulty Multiplier: x" + game.difficultyMultiplier + "\n" +
    "Distance Multiplier: x" + game.distanceMultiplier + "\n" +
    "Total Cash Earned: +$" + game.totalReward;
},

    drawExtras(car: any) {}
	
	
};
