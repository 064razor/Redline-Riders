import { Game } from "./game.js";
import { Input } from "./input.js";
import { UI } from "./ui.js";
import { Shop } from "./shop.js";
document.getElementById("startBtn").onclick = () => {
    Game.start();
};
document.getElementById("buyTires")
    .onclick = () => {
    Shop.buyTires(Game);
};
document.getElementById("buyEngine")
    .onclick = () => {
    Shop.buyEngine(Game);
};
// TEMP bridge so your HTML button still works
window.Game = Game;
// Initialize systems
Input.init(Game);
UI.init();
