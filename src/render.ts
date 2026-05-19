import { Bodywork } from "./bodywork.js";
import { Options } from "./options.js";
import { Game } from "./game.js";
import { UI } from "./ui.js";
import { speedToMph } from "./speed.js";
import { Decals } from "./decals.js";

const backgroundImage = new Image();
backgroundImage.src = "./assets/backgrounds/night-city.png";

const paintCanvas = document.createElement("canvas");
const paintCtx = paintCanvas.getContext("2d")!;
const unpaintedCanvas = document.createElement("canvas");
const unpaintedCtx = unpaintedCanvas.getContext("2d")!;
const decalCanvas = document.createElement("canvas");
const decalCtx = decalCanvas.getContext("2d")!;
const carBodyImages: Record<string, HTMLImageElement> = {};
const paintMaskImages: Record<string, HTMLImageElement> = {};
const decalImages: Record<string, HTMLImageElement> = {};

function getBodyImage(bodyId: string, imagePath: string) {
    if (!carBodyImages[bodyId]) {
        const img = new Image();
        img.src = imagePath;
        carBodyImages[bodyId] = img;
    }

    return carBodyImages[bodyId];
}

function getPaintMaskImage(bodyId: string, imagePath: string) {
    if (!paintMaskImages[bodyId]) {
        const img = new Image();
        img.src = imagePath;
        paintMaskImages[bodyId] = img;
    }

    return paintMaskImages[bodyId];
}
function getDecalImage(decalId: string, imagePath: string) {
    if (!decalImages[decalId]) {
        const img = new Image();
        img.src = imagePath;
        decalImages[decalId] = img;
    }

    return decalImages[decalId];
}

function isImageReady(image: HTMLImageElement) {
    return image.complete && image.naturalWidth > 0;
}

function drawCarBody(
    ctx: CanvasRenderingContext2D,
    car: any,
    x: number,
    y: number,
    facing: number
) {
    const bodyId = car.bodyId || "maruMk5";
    const body = (Bodywork.cars as any)[bodyId];

    if (!body) return;

    const sprite = body.sprite;
    const bodyImage = getBodyImage(body.id, sprite.imagePath);
    const paintMaskImage = sprite.paintMaskPath
        ? getPaintMaskImage(body.id, sprite.paintMaskPath)
        : null;
    const rimStyle = car.rimStyle || "classic5";

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    // ===== SHADOW =====
    ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
    ctx.beginPath();
    ctx.ellipse(-12, 38, 58, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // ===== UNDERGLOW =====
    if (car.underglowColor) {
        const outerGlow = ctx.createRadialGradient(
            -12,
            40,
            2,
            -12,
            40,
            66
        );

        outerGlow.addColorStop(0, car.underglowColor);
        outerGlow.addColorStop(0.32, car.underglowColor);
        outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.42;
        ctx.shadowColor = car.underglowColor;
        ctx.shadowBlur = 18;
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.ellipse(-12, 40, 68, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.68;
        ctx.shadowBlur = 10;
        ctx.fillStyle = car.underglowColor;
        ctx.beginPath();
        ctx.ellipse(-12, 39, 42, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // ===== SHIFT BODY ROCK =====
    const shiftJoltDuration = car.shiftJoltDuration || 0;
    const shiftJoltTimer = car.shiftJoltTimer || 0;

    if (shiftJoltDuration > 0 && shiftJoltTimer > 0) {
        const shiftProgress =
            shiftJoltTimer / shiftJoltDuration;

        const shiftElapsed =
            1 - shiftProgress;

        const shiftStrength =
            car.shiftJoltStrength || 1;

        const rock =
            Math.sin(shiftElapsed * Math.PI * 2) * 0.007 * shiftStrength;

        ctx.translate(0, 31);
        ctx.rotate(rock);
        ctx.translate(0, -31);
    }

    const drivetrain =
        car.drivetrain ||
        (
            car.bodyId === "swagGG2" ||
            car.bodyId === "hannaCivilian" ||
            car.bodyId === "swagLadybug2024"
                ? "FWD"
                : car.bodyId === "scholarVibratio"
                    ? "AWD"
                : "RWD"
        );

    const poweredWheel =
        drivetrain === "FWD"
            ? sprite.frontWheel
            : sprite.rearWheel;

    // ===== WHEELSPIN SMOKE =====
    if (car.wheelspin) {
        const smokeIntensity =
            Math.max(0.2, Math.min(car.wheelspinIntensity || 0.45, 1));

        ctx.save();
        ctx.globalAlpha = (0.14 + Math.random() * 0.08) * smokeIntensity;
        ctx.fillStyle = "rgba(225, 225, 225, 0.55)";

        const puffCount =
            smokeIntensity > 0.62 ? 3 : 2;

        for (let i = 0; i < puffCount; i++) {
            const puffX =
                poweredWheel.x - 8 - Math.random() * 12;

            const puffY =
                poweredWheel.y + 3 - Math.random() * 5;

            const puffWidth =
                poweredWheel.radius * (0.9 + smokeIntensity * 0.75 + Math.random() * 0.55);

            const puffHeight =
                poweredWheel.radius * (0.42 + smokeIntensity * 0.3 + Math.random() * 0.28);

            ctx.beginPath();
            ctx.ellipse(
                puffX,
                puffY,
                puffWidth,
                puffHeight,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }

    // ===== TIRES =====
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();

    ctx.arc(
        sprite.rearWheel.x,
        sprite.rearWheel.y,
        sprite.rearWheel.radius,
        0,
        Math.PI * 2
    );

    ctx.arc(
        sprite.frontWheel.x,
        sprite.frontWheel.y,
        sprite.frontWheel.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    const brakeDive =
        Math.max(0, Math.min(car.brakeDive || 0, 1));

    ctx.save();

    if (brakeDive > 0) {
        const bodyDiveAngle =
            brakeDive * 0.055;

        const rearWheel =
            sprite.rearWheel;

        ctx.translate(rearWheel.x, rearWheel.y);
        ctx.rotate(bodyDiveAngle);
        ctx.translate(-rearWheel.x, -rearWheel.y);
    }

    // ===== BODY IMAGE + PAINT =====
    if (isImageReady(bodyImage)) {
        const hasPaintMask =
            paintMaskImage && isImageReady(paintMaskImage);

        if (car.paintColor && hasPaintMask) {
            unpaintedCanvas.width = sprite.width;
            unpaintedCanvas.height = sprite.height;

            unpaintedCtx.clearRect(
                0,
                0,
                unpaintedCanvas.width,
                unpaintedCanvas.height
            );

            unpaintedCtx.globalCompositeOperation = "source-over";

            unpaintedCtx.drawImage(
                bodyImage,
                0,
                0,
                sprite.width,
                sprite.height
            );

            unpaintedCtx.globalCompositeOperation = "destination-out";

            unpaintedCtx.drawImage(
                paintMaskImage,
                0,
                0,
                sprite.width,
                sprite.height
            );

            unpaintedCtx.globalCompositeOperation = "source-over";

            ctx.drawImage(
                unpaintedCanvas,
                sprite.xOffset,
                sprite.yOffset,
                sprite.width,
                sprite.height
            );
        }
        else if (!car.paintColor) {
            ctx.drawImage(
                bodyImage,
                sprite.xOffset,
                sprite.yOffset,
                sprite.width,
                sprite.height
            );
        }

        if (car.paintColor) {
            paintCanvas.width = sprite.width;
            paintCanvas.height = sprite.height;

            paintCtx.clearRect(
                0,
                0,
                paintCanvas.width,
                paintCanvas.height
            );

            paintCtx.globalCompositeOperation = "source-over";

            paintCtx.drawImage(
                bodyImage,
                0,
                0,
                sprite.width,
                sprite.height
            );

            paintCtx.globalCompositeOperation = "multiply";
            paintCtx.fillStyle = car.paintColor;

            paintCtx.fillRect(
                0,
                0,
                sprite.width,
                sprite.height
            );

            paintCtx.globalCompositeOperation = "destination-in";

            paintCtx.drawImage(
                hasPaintMask ? paintMaskImage : bodyImage,
                0,
                0,
                sprite.width,
                sprite.height
            );

            paintCtx.globalCompositeOperation = "source-over";

            ctx.drawImage(
                paintCanvas,
                sprite.xOffset,
                sprite.yOffset,
                sprite.width,
                sprite.height
            );
        }

        ctx.globalCompositeOperation = "source-over";

        const decal = Decals.get(car.decalId || "none");

        if (decal.imagePath) {
            const decalImage = getDecalImage(decal.id, decal.imagePath);
            const decalClipImage =
                hasPaintMask && paintMaskImage
                    ? paintMaskImage
                    : bodyImage;

            if (isImageReady(decalImage)) {
                decalCanvas.width = sprite.width;
                decalCanvas.height = sprite.height;

                decalCtx.clearRect(
                    0,
                    0,
                    decalCanvas.width,
                    decalCanvas.height
                );

                decalCtx.globalCompositeOperation = "source-over";

                decalCtx.drawImage(
                    decalImage,
                    0,
                    0,
                    sprite.width,
                    sprite.height
                );

                if (decal.colorable) {
                    decalCtx.globalCompositeOperation = "source-in";
                    decalCtx.fillStyle = car.decalColor || decal.defaultColor || "#ffffff";
                    decalCtx.fillRect(
                        0,
                        0,
                        sprite.width,
                        sprite.height
                    );
                }

                decalCtx.globalCompositeOperation = "destination-in";

                decalCtx.drawImage(
                    decalClipImage,
                    0,
                    0,
                    sprite.width,
                    sprite.height
                );

                decalCtx.globalCompositeOperation = "source-over";

                // ===== DECAL OVERLAY =====
                ctx.drawImage(
                    decalCanvas,
                    sprite.xOffset,
                    sprite.yOffset,
                    sprite.width,
                    sprite.height
                );
            }
        }
    }

    ctx.restore();

    // ===== RIMS =====
    const wheelSpin =
        car.pos * 4.45 +
        car.spd * 2.95;

    const speedBlur =
        Math.min(speedToMph(Math.abs(car.spd)) / 160, 1);

    const spinSlip =
        car.wheelspin
            ? 8 + Math.random() * 3
            : 0;

    const rearSpin =
        wheelSpin + (drivetrain === "RWD" || drivetrain === "AWD" ? spinSlip : 0);

    const frontSpin =
        wheelSpin + 0.35 + (drivetrain === "FWD" || drivetrain === "AWD" ? spinSlip : 0);

    const drivenBlur =
        car.wheelspin
            ? Math.min(speedBlur + 0.45, 1)
            : speedBlur;

    Bodywork.drawRim(
        ctx,
        rimStyle,
        sprite.rearWheel.x,
        sprite.rearWheel.y,
        rearSpin,
        drivetrain === "RWD" || drivetrain === "AWD" ? drivenBlur : speedBlur,
        sprite.rearWheel.rimScale || sprite.rearWheel.radius / 8
    );

    Bodywork.drawRim(
        ctx,
        rimStyle,
        sprite.frontWheel.x,
        sprite.frontWheel.y,
        frontSpin,
        drivetrain === "FWD" || drivetrain === "AWD" ? drivenBlur : speedBlur,
        sprite.frontWheel.rimScale || sprite.frontWheel.radius / 8
    );

    ctx.restore();
}

function drawProgressBars(
    ctx: CanvasRenderingContext2D,
    player: any,
    ai: any
) {
    if (!ai) {
        const playerProgress =
            Math.min(player.pos / Game.trackLength, 1);

        const barWidth = 150;
        const barHeight = 10;
        const hudX = 20;
        const playerBarY = 10;

        ctx.fillStyle = "#222";
        ctx.fillRect(hudX, playerBarY, barWidth, barHeight);

        ctx.fillStyle = player.paintColor || "red";
        ctx.fillRect(
            hudX,
            playerBarY,
            barWidth * playerProgress,
            barHeight
        );

        ctx.beginPath();
        ctx.arc(
            hudX + (barWidth * playerProgress),
            playerBarY + (barHeight / 2),
            4,
            0,
            Math.PI * 2
        );
        ctx.fill();
        return;
    }

    const playerProgress =
        Math.min(player.pos / Game.trackLength, 1);

    const aiProgress =
        Math.min(ai.pos / Game.trackLength, 1);

    const barWidth = 150;
    const barHeight = 10;
    const hudX = 20;

    const playerBarY =
        Options.lane === "top"
            ? 10
            : 26;

    const aiBarY =
        Options.lane === "top"
            ? 26
            : 10;

    // ===== BAR BACKGROUNDS =====
    ctx.fillStyle = "#222";
    ctx.fillRect(hudX, playerBarY, barWidth, barHeight);
    ctx.fillRect(hudX, aiBarY, barWidth, barHeight);

    // ===== PLAYER BAR =====
    ctx.fillStyle = player.paintColor || "red";
    ctx.fillRect(
        hudX,
        playerBarY,
        barWidth * playerProgress,
        barHeight
    );

    // ===== AI BAR =====
    ctx.fillStyle = ai.paintColor || "white";
    ctx.fillRect(
        hudX,
        aiBarY,
        barWidth * aiProgress,
        barHeight
    );

    // ===== PLAYER DOT =====
    ctx.fillStyle = player.paintColor || "red";
    ctx.beginPath();
    ctx.arc(
        hudX + (barWidth * playerProgress),
        playerBarY + (barHeight / 2),
        4,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // ===== AI DOT =====
    ctx.fillStyle = ai.paintColor || "white";
    ctx.beginPath();
    ctx.arc(
        hudX + (barWidth * aiProgress),
        aiBarY + (barHeight / 2),
        4,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawBackground(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
) {
    if (
        backgroundImage.complete &&
        backgroundImage.naturalWidth > 0
    ) {
        ctx.drawImage(
            backgroundImage,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }
    else {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Dark overlay so cars and UI stay readable.
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawRoad(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    camX: number,
    playerX: number,
    direction: number,
    worldScale: number
) {
    const roadTop = 145;
    const roadHeight = canvas.height - roadTop;

    const roadGradient = ctx.createLinearGradient(
        0,
        roadTop,
        0,
        canvas.height
    );

    roadGradient.addColorStop(0, "rgba(36, 36, 40, 0.82)");
    roadGradient.addColorStop(0.55, "rgba(22, 22, 25, 0.9)");
    roadGradient.addColorStop(1, "rgba(8, 8, 10, 0.96)");

    ctx.fillStyle = roadGradient;
    ctx.fillRect(0, roadTop, canvas.width, roadHeight);

    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(0, roadTop, canvas.width, 2);

    const dashWidth = 42;
    const dashGap = 34;
    const dashCycle = dashWidth + dashGap;
    const dashHeight = 4;
    const dashY = 173;
    const offset =
        ((playerX - (camX * direction * worldScale)) % dashCycle + dashCycle) %
        dashCycle;

    ctx.fillStyle = "rgba(245, 245, 235, 0.78)";

    for (
        let x = offset - dashCycle;
        x < canvas.width + dashCycle;
        x += dashCycle
    ) {
        ctx.fillRect(x, dashY, dashWidth, dashHeight);
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.09)";
    ctx.fillRect(0, 204, canvas.width, 2);
}

function drawCountdownLights(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
) {
    const showingLaunchGreen =
        Game.raceStarted &&
        Game.launchTriggered &&
        Game.launchTimer > 0;

    if (!Game.countdownActive && !showingLaunchGreen) return;

    const centerX =
        canvas.width / 2;

    const y =
        28;

    const radius =
        11;

    const spacing =
        32;

    const lights = [
        {
            x: centerX - spacing,
            color: "#ff3838",
            active: Game.countdownActive && Game.countdownValue >= 3
        },
        {
            x: centerX,
            color: "#ffd23a",
            active: Game.countdownActive && Game.countdownValue <= 2
        },
        {
            x: centerX + spacing,
            color: "#39ff57",
            active: showingLaunchGreen
        }
    ];

    ctx.save();
    ctx.fillStyle = "rgba(8, 10, 14, 0.72)";
    ctx.strokeStyle = "rgba(210, 220, 235, 0.38)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.roundRect(centerX - 64, y - 20, 128, 40, 9);
    ctx.fill();
    ctx.stroke();

    for (const light of lights) {
        ctx.beginPath();
        ctx.fillStyle =
            light.active
                ? light.color
                : "rgba(45, 49, 56, 0.95)";

        ctx.shadowColor =
            light.active
                ? light.color
                : "transparent";

        ctx.shadowBlur =
            light.active ? 14 : 0;

        ctx.arc(light.x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.stroke();
    }

    ctx.restore();
}

export const Render = {

    drawCar(
        ctx: CanvasRenderingContext2D,
        car: any,
        x: number,
        y: number,
        facing: number = 1
    ) {
        drawCarBody(
            ctx,
            car,
            x,
            y,
            facing
        );
    },

    draw(player: any, ai: any) {
        if (!player) return;

        const canvas =
            document.getElementById("gameCanvas") as HTMLCanvasElement;

        const ctx =
            canvas.getContext("2d")!;

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        drawBackground(ctx, canvas);

        // ===== CAMERA =====
        const camX = player.pos;
        const worldScale = 32;

        // ===== PLAYER SCREEN POSITION =====
        const playerX =
            Options.raceDirection === "left"
                ? canvas.width - 190
                : 150;

        // ===== WORLD DIRECTION =====
        const direction =
            Options.raceDirection === "left"
                ? -1
                : 1;

        drawRoad(
            ctx,
            canvas,
            camX,
            playerX,
            direction,
            worldScale
        );

        drawCountdownLights(ctx, canvas);

        // ===== LINE POSITIONING =====
        const lineOffset = 20;
        const tileSize = 8;
        const lineWidth = 13;

        // ===== FINISH LINE =====
        const finishWorld = Game.trackLength;

        const finishX =
            playerX +
            ((finishWorld - camX) * direction * worldScale) +
            (lineOffset * direction);

        const finishDrawX =
            direction === -1
                ? finishX - (lineWidth * 2)
                : finishX;

        for (let y = 0; y < canvas.height; y += tileSize) {
            const row =
                Math.floor(y / tileSize);

            ctx.fillStyle =
                row % 2 === 0
                    ? "#ffffff"
                    : "#000000";

            ctx.fillRect(
                finishDrawX,
                y,
                lineWidth,
                tileSize
            );

            ctx.fillStyle =
                row % 2 === 0
                    ? "#000000"
                    : "#ffffff";

            ctx.fillRect(
                finishDrawX + lineWidth,
                y,
                lineWidth,
                tileSize
            );
        }

        // ===== START LINE =====
        const startWorld = 0;

        const startX =
            playerX +
            ((startWorld - camX) * direction * worldScale) +
            (lineOffset * direction);

        const startDrawX =
            direction === -1
                ? startX - lineWidth
                : startX;

        ctx.fillStyle = "#008d38";
        ctx.fillRect(
            startDrawX,
            0,
            lineWidth,
            canvas.height
        );

        // ===== LANE POSITIONS =====
        const topLaneY = 134;
        const bottomLaneY = 168;

        const playerLaneY =
            Options.lane === "top"
                ? topLaneY
                : bottomLaneY;

        const aiLaneY =
            Options.lane === "top"
                ? bottomLaneY
                : topLaneY;

        const aiOffset =
            ai
                ? (ai.pos - camX) * direction * worldScale
                : 0;

        const carsByLaneDepth = [
            {
                car: player,
                x: playerX,
                y: playerLaneY
            }
        ];

        if (ai) {
            carsByLaneDepth.push({
                car: ai,
                x: playerX + aiOffset,
                y: aiLaneY
            });
        }

        carsByLaneDepth.sort((a, b) => a.y - b.y);

        for (const carDraw of carsByLaneDepth) {
            drawCarBody(
                ctx,
                carDraw.car,
                carDraw.x,
                carDraw.y,
                direction
            );
        }

        // ===== PROGRESS BARS LAST SO START LINE DOES NOT COVER THEM =====
        drawProgressBars(
            ctx,
            player,
            ai
        );

        // ===== POSITION ARROWS =====
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";

        if (ai && aiOffset > 260) {
            ctx.fillText(">>", canvas.width - 40, 50);
        }

        if (ai && aiOffset < -260) {
            ctx.fillText("<<", 20, 50);
        }

        // ===== UI OVERLAYS =====
        UI.drawExtras(player);
    }

};
