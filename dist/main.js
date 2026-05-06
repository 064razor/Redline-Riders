import { Game } from "./game.js";
import { Input } from "./input.js";
import { UI } from "./ui.js";
// TEMP bridge so your HTML button still works
window.Game = Game;
// Initialize systems
Input.init(Game);
UI.init();
