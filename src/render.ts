console.log("render loaded");
import { UI } from "./ui.js";
export const Render = {

    draw(player, ai) {
        const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d")!;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ===== CAMERA =====
        const camX = player.pos;

        // ===== PLAYER =====
        ctx.fillStyle = "red";
        ctx.fillRect(150, 80, 40, 20);

        // ===== AI =====
        const aiOffset = ai.pos - camX;

        ctx.fillStyle = "white";
        ctx.fillRect(150 + aiOffset, 40, 40, 20);

        // ===== POSITION ARROWS =====
        ctx.fillStyle = "white";

        if (aiOffset > 200) ctx.fillText(">>", 260, 50);
        if (aiOffset < -200) ctx.fillText("<<", 20, 50);

        // ===== UI OVERLAYS (VERY IMPORTANT ORDER) =====
        UI.drawExtras(player);
    }

};