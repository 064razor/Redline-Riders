import { Bodywork } from "./bodywork.js";
import { Options } from "./options.js";
import { Game } from "./game.js";
import { UI } from "./ui.js";
const paintCanvas = document.createElement("canvas");
const paintCtx = paintCanvas.getContext("2d");
const carBodyImages = {};
function getBodyImage(bodyId, imagePath) {
    if (!carBodyImages[bodyId]) {
        const img = new Image();
        img.src = imagePath;
        carBodyImages[bodyId] = img;
    }
    return carBodyImages[bodyId];
}
function drawCarBody(ctx, car, x, y, facing) {
    const bodyId = car.bodyId || "maruMk5";
    const body = Bodywork.cars[bodyId];
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
    ctx.arc(sprite.rearWheel.x, sprite.rearWheel.y, sprite.rearWheel.radius, 0, Math.PI * 2);
    ctx.arc(sprite.frontWheel.x, sprite.frontWheel.y, sprite.frontWheel.radius, 0, Math.PI * 2);
    ctx.fill();
    // ===== BODY IMAGE + PAINT =====
    if (bodyImage.complete && bodyImage.naturalWidth > 0) {
        if (car.paintColor) {
            paintCanvas.width = sprite.width;
            paintCanvas.height = sprite.height;
            paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
            // Draw original body onto offscreen canvas
            paintCtx.globalCompositeOperation = "source-over";
            paintCtx.drawImage(bodyImage, 0, 0, sprite.width, sprite.height);
            // Tint offscreen only
            paintCtx.globalCompositeOperation = "multiply";
            paintCtx.fillStyle = car.paintColor;
            paintCtx.fillRect(0, 0, sprite.width, sprite.height);
            // Restore image alpha offscreen only
            paintCtx.globalCompositeOperation = "destination-in";
            paintCtx.drawImage(bodyImage, 0, 0, sprite.width, sprite.height);
            paintCtx.globalCompositeOperation = "source-over";
            // Draw finished tinted body to main canvas
            ctx.drawImage(paintCanvas, sprite.xOffset, sprite.yOffset, sprite.width, sprite.height);
        }
        else {
            ctx.drawImage(bodyImage, sprite.xOffset, sprite.yOffset, sprite.width, sprite.height);
        }
        ctx.globalCompositeOperation = "source-over";
    }
    // ===== RIMS =====
    const wheelSpin = car.pos * 4.45 +
        car.spd * 2.95;
    const speedBlur = Math.min(Math.abs(car.spd) / 8, 1);
    drawRim(ctx, rimStyle, sprite.rearWheel.x, sprite.rearWheel.y, wheelSpin, speedBlur);
    drawRim(ctx, rimStyle, sprite.frontWheel.x, sprite.frontWheel.y, wheelSpin + 0.35, speedBlur);
    ctx.restore();
}
function drawRim(ctx, style, x, y, rotation = 0, blur = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    if (blur > 0.25) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + blur * 0.35})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + blur * 0.25})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.strokeStyle = "#dcdcdc";
    ctx.lineWidth = 2;
    if (style === "classic5") {
        for (let i = 0; i < 5; i++) {
            const a = (Math.PI * 2 / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * 7.5, Math.sin(a) * 7.5);
            ctx.stroke();
        }
    }
    else if (style === "split6") {
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI * 2 / 6) * i;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a - 0.08) * 2, Math.sin(a - 0.08) * 2);
            ctx.lineTo(Math.cos(a - 0.08) * 7, Math.sin(a - 0.08) * 7);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(Math.cos(a + 0.08) * 2, Math.sin(a + 0.08) * 2);
            ctx.lineTo(Math.cos(a + 0.08) * 7, Math.sin(a + 0.08) * 7);
            ctx.stroke();
        }
    }
    else if (style === "mesh") {
        ctx.strokeStyle = "#cfcfcf";
        for (let i = -6; i <= 6; i += 3) {
            ctx.beginPath();
            ctx.moveTo(-7, i);
            ctx.lineTo(7, -i);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-7, -i);
            ctx.lineTo(7, i);
            ctx.stroke();
        }
    }
    else if (style === "deepDish") {
        ctx.strokeStyle = "#bfbfbf";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.stroke();
    }
    else if (style === "star") {
        for (let i = 0; i < 5; i++) {
            const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * 7.5, Math.sin(a) * 7.5);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ddd";
        ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}
export const Render = {
    draw(player, ai) {
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ===== CAMERA =====
        const camX = player.pos;
        // ===== PLAYER SCREEN POSITION =====
        const playerX = Options.raceDirection === "left"
            ? canvas.width - 190
            : 150;
        // ===== WORLD DIRECTION =====
        const direction = Options.raceDirection === "left"
            ? -1
            : 1;
        // ===== FINISH LINE =====
        const finishWorld = Game.trackLength;
        const finishX = playerX + ((finishWorld - camX) * direction);
        const tileSize = 10;
        for (let y = 0; y < canvas.height; y += tileSize) {
            const row = Math.floor(y / tileSize);
            ctx.fillStyle = row % 2 === 0 ? "#ffffff" : "#000000";
            ctx.fillRect(finishX, y, tileSize, tileSize);
            ctx.fillStyle = row % 2 === 0 ? "#000000" : "#ffffff";
            ctx.fillRect(finishX + tileSize, y, tileSize, tileSize);
        }
        // ===== START LINE =====
        const startWorld = 0;
        const startX = playerX + ((startWorld - camX) * direction);
        ctx.fillStyle = "#00aa44";
        ctx.fillRect(startX, 0, 10, canvas.height);
        // ===== RACE PROGRESS =====
        const playerProgress = Math.min(player.pos / Game.trackLength, 1);
        const aiProgress = Math.min(ai.pos / Game.trackLength, 1);
        // ===== PROGRESS BAR SETTINGS =====
        const barWidth = 100;
        const barHeight = 10;
        const hudX = 20;
        const playerBarY = Options.lane === "top"
            ? 5
            : 20;
        const aiBarY = Options.lane === "top"
            ? 20
            : 5;
        // ===== BAR BACKGROUNDS =====
        ctx.fillStyle = "#222";
        ctx.fillRect(hudX, playerBarY, barWidth, barHeight);
        ctx.fillRect(hudX, aiBarY, barWidth, barHeight);
        // ===== PLAYER BAR =====
        ctx.fillStyle = player.paintColor || "red";
        ctx.fillRect(hudX, playerBarY, barWidth * playerProgress, barHeight);
        // ===== AI BAR =====
        ctx.fillStyle = ai.paintColor || "white";
        ctx.fillRect(hudX, aiBarY, barWidth * aiProgress, barHeight);
        // ===== PLAYER DOT =====
        ctx.fillStyle = player.paintColor || "red";
        ctx.beginPath();
        ctx.arc(hudX + (barWidth * playerProgress), playerBarY + (barHeight / 2), 4, 0, Math.PI * 2);
        ctx.fill();
        // ===== AI DOT =====
        ctx.fillStyle = ai.paintColor || "white";
        ctx.beginPath();
        ctx.arc(hudX + (barWidth * aiProgress), aiBarY + (barHeight / 2), 4, 0, Math.PI * 2);
        ctx.fill();
        // ===== LANE POSITIONS =====
        const topLaneY = 28;
        const bottomLaneY = 88;
        const playerLaneY = Options.lane === "top"
            ? topLaneY
            : bottomLaneY;
        const aiLaneY = Options.lane === "top"
            ? bottomLaneY
            : topLaneY;
        // ===== PLAYER =====
        drawCarBody(ctx, player, playerX, playerLaneY, direction);
        // ===== AI =====
        const aiOffset = (ai.pos - camX) * direction;
        drawCarBody(ctx, ai, playerX + aiOffset, aiLaneY, direction);
        // ===== POSITION ARROWS =====
        ctx.fillStyle = "white";
        if (aiOffset > 200)
            ctx.fillText(">>", 260, 50);
        if (aiOffset < -200)
            ctx.fillText("<<", 20, 50);
        // ===== UI OVERLAYS =====
        UI.drawExtras(player);
    }
};
