import { Game } from "./game";
import { Input } from "./input";
import { UI } from "./ui";
// TEMP bridge so your HTML button still works
window.Game = Game;
// Initialize systems
Input.init(Game);
UI.init();
