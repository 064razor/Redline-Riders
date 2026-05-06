"use strict";
const Menu = {
    startGame() {
        this.hideAll();
        document.getElementById("raceUI").classList.remove("hidden");
    },
    showOptions() {
        this.hideAll();
        document.getElementById("optionsMenu").classList.remove("hidden");
    },
    back() {
        this.hideAll();
        document.getElementById("mainMenu").classList.remove("hidden");
    },
    hideAll() {
        document.getElementById("mainMenu").classList.add("hidden");
        document.getElementById("raceUI").classList.add("hidden");
        document.getElementById("optionsMenu").classList.add("hidden");
    }
};
