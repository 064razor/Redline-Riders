import { Bodywork } from "./bodywork.js";
import { Options } from "./options.js";
import { Game } from "./game.js";
import { UI } from "./ui.js";

const backgroundImage = new Image();
backgroundImage.src = "./assets/backgrounds/night-city.png";
const paintCanvas = document.createElement("canvas");
const paintCtx = paintCanvas.getContext("2d")!;
const carBodyImages: Record<string, HTMLImageElement> = {};

function getBodyImage(bodyId: string, imagePath: string) {
    if (!carBodyImages[bodyId]) {
        const img = new Image();
        img.src = imagePath;
        carBodyImages[bodyId] = img;
    }

    return carBodyImages[bodyId];
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
    const sprite = body.sprite;

    const bodyImage = getBodyImage(body.id, sprite.imagePath);
    const rimStyle = car.rimStyle || "classic5";

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    // ===== SHADOW =====
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.ellipse(48, 38, 58, 7, 0, 0, Math.PI * 2);
    ctx.fill();

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

    // ===== BODY IMAGE + PAINT =====
    if (bodyImage.complete && bodyImage.naturalWidth > 0) {
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
                bodyImage,
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
        else {
            ctx.drawImage(
                bodyImage,
                sprite.xOffset,
                sprite.yOffset,
                sprite.width,
                sprite.height
            );
        }

        ctx.globalCompositeOperation = "source-over";
    }

    // ===== RIMS =====
    const wheelSpin =
        car.pos * 4.45 +
        car.spd * 2.95;

    const speedBlur =
        Math.min(Math.abs(car.spd) / 8, 1);

    Bodywork.drawRim(
        ctx,
        rimStyle,
        sprite.rearWheel.x,
        sprite.rearWheel.y,
        wheelSpin,
        speedBlur
    );

    Bodywork.drawRim(
        ctx,
        rimStyle,
        sprite.frontWheel.x,
        sprite.frontWheel.y,
        wheelSpin + 0.35,
        speedBlur
    );

    ctx.restore();
}



function drawProgressBars(
    ctx: CanvasRenderingContext2D,
    player: any,
    ai: any
) {
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

    // Dark overlay so cars and UI stay readable
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export const Render = {

    draw(player: any, ai: any) {
		if (!player || !ai) return;
		
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

        // ===== FINISH LINE =====
        const finishWorld = Game.trackLength;

        const finishX =
            playerX +
            ((finishWorld - camX) * direction * worldScale);

        const tileSize = 8;
        const lineWidth = 13

        for (let y = 0; y < canvas.height; y += tileSize) {
            const row =
                Math.floor(y / tileSize);

            ctx.fillStyle = 
                row % 2 === 0
                    ? "#ffffff"
                    : "#000000";

            ctx.fillRect(
                finishX,
                y,
                lineWidth,
                tileSize
                );
				
            ctx.fillStyle =
                row % 2 === 0
                    ? "#000000"
                    : "#ffffff";

            ctx.fillRect(
                finishX + lineWidth,
                y,
                lineWidth,
                tileSize
            );
        }

        // ===== START LINE =====
        const startWorld = 0;

        const startX =
            playerX +
            ((startWorld - camX) * direction * worldScale);
			
        ctx.fillStyle = "#00ff66";
        ctx.fillRect(
            startX,
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

        // ===== PLAYER =====
        drawCarBody(
            ctx,
            player,
            playerX,
            playerLaneY,
            direction
        );

        // ===== AI =====
        const aiOffset =
            (ai.pos - camX) * direction * worldScale;

        drawCarBody(
            ctx,
            ai,
            playerX + aiOffset,
            aiLaneY,
            direction
        );

        // ===== PROGRESS BARS LAST SO START LINE DOES NOT COVER THEM =====
        drawProgressBars(
            ctx,
            player,
            ai
        );

        // ===== POSITION ARROWS =====
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";

        if (aiOffset > 260) {
            ctx.fillText(">>", canvas.width - 40, 50);
        }

        if (aiOffset < -260) {
            ctx.fillText("<<", 20, 50);
        }

        // ===== UI OVERLAYS =====
        UI.drawExtras(player);
    }

};