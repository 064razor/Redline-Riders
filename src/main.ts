import { Game } from "./game.js";
import { Input } from "./input.js";
import { UI } from "./ui.js";
import { Shop } from "./shop.js";

document.getElementById("startBtn")!.onclick = () => {
    Game.start();
};

(document.getElementById("buyTires") as HTMLButtonElement)
.onclick = () => {
    Shop.buyTires(Game);
};

(document.getElementById("buyEngine") as HTMLButtonElement)
.onclick = () => {
    Shop.buyEngine(Game);
};

// TEMP bridge so your HTML button still works
(window as any).Game = Game;

// Initialize systems
Input.init(Game);
UI.init();
