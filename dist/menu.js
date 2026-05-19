export const Menu = {
    panels: [
        "racePanel",
        "eventPanel",
        "garagePreviewSlot",
        "garagePanel",
        "upgradePanel",
        "dealerPanel",
        "customizePanel",
        "statsPanel",
        "optionsPanel",
        "savePanel"
    ],
    hintIndex: 0,
    hints: {
        racePanel: [
            "Longer races have greater payout, so does higher difficulty.",
            "Good and perfect shifting and launching gives you extra cash at the end of a race.",
            "Try not to shift far too early or else your car's engine will stall.",
            "Avoid staying stuck in the redline. You need to shift gears to continue going faster.",
            "Want the edge in long races? Upgrade your transmission for higher top speed.",
            "If you're struggling, or find things too easy, you can always change difficulty.",
            "Don't settle with a mismatch, you can select your opponent before you race.",
            "Want to win more? Use your car's abilites on a track lenght that suits it the best.",
            "You can use money you earn in races to upgrade, customize or even buy a new car.",
            "Looks can be decieving, never underestimate an opponent that doesn't look too fast.",
            "Know your car! It's not adventageous to pick track configurations that works against your car's strengths."
        ],
        eventPanel: [
            "Events will become curated race challenges with their own difficulty.",
            "Difficulty labels give you a quick sense of how demanding an event should feel.",
            "Future events can become a home for tournaments, rival races, and special rewards."
        ],
        garagePanel: [
            "All cars purchased are stored here.",
            "You can swap between any car you've purchased in the garage.",
            "Don't forget what car you're in before you race.",
            "A master of many can beat any...body.",
            "For now, you cannot sell any cars yet in this version.",
            "The graph displays the peak torque and horsepower of your current car.",
            "Aspiration radically transforms a car's torque curve.",
            "Be mindful of your stats. Too much power is harmful and too much grip without power is redundant and expensive."
        ],
        upgradePanel: [
            "Aspiration upgrades can boost your car to new heights, but you can only choose one per car.",
            "If you're struggling with wheelspin, upgrade your grip for a cleaner lauch.",
            "Transmission upgrades will help you reach those higher speeds.",
            "Upgrade your torque and power to get faster times on the drag strip.",
            "Prices increase with every upgrade level. Plan accordingly.",
            "Opponents can also use upgrades for their car to stay competitive.",
            "Upgrade shift time with the flywheel if you need an extra edge.",
            "Upgrading aero reduces air resistance and lets your car breeze by faster.",
            "Reducing weight lets your car get a little more nimble off the line."
        ],
        dealerPanel: [
            "Test Drive cars to experience how they drive before you buy.",
            "Any car is a viable car when in the right situation.",
            "Not every car performs the same, each have their own strengths and weaknesses.",
            "The most expensive isn't always best, the cheapest isn't always the worst.",
            "The best car to drive is the car you enjoy the most.",
            "Top speed matters more as track length increases."
        ],
        customizePanel: [
            "Decal previews show the style before you spend money.",
            "Cosmetics save per car, so each build can keep its own identity.",
            "Disclaimer: Flame decals do NOT make your car any faster.",
            "Want to make your car stand out from the rest? Apply a new decal with a custom color."
        ],
        statsPanel: [
            "Stats track race results, spending, earnings, car usage, and playtime.",
            "Most used car updates when you start races or practice runs.",
            "Money earned only counts race payouts; money spent counts upgrades, cosmetics, and cars."
        ],
        optionsPanel: [
            "You can adjust the volume settings to fit your preference.",
            "You can change measurement systems to your preference.",
            "You don't always need to race on the bottom. You can select to race on the top lane if you prefer.",
            "Ever wanted to race from right to left? You can activate left-facing mode in the settings.",
            "By default, Imperial is the main configuration. You can adjust any part freely to your preferences."
        ],
        savePanel: [
            "Manual save slots can be useful before experimenting with major performance upgrades.",
            "Loading a save updates money and garage state immediately.",
            "Exporting a save is a great way to preserve all your progress regardless of what happens on the browser.",
            "The game autosaves by default but you have to manually load your stored save when opening the browser."
        ],
        default: [
            "Practice mode is free, making it useful for learning shift timing.",
            "Cars with lower top speed can still win short races with launch and torque.",
            "Forced induction affects sound, boost behavior, and the power curve."
        ]
    },
    init() {
        this.bindButton("raceMenuBtn", "racePanel");
        this.bindButton("eventMenuBtn", "eventPanel", () => {
            if (window.syncEventUI) {
                window.syncEventUI();
            }
        });
        this.bindButton("garageMenuBtn", "garagePanel");
        this.bindButton("upgradeMenuBtn", "upgradePanel");
        this.bindButton("dealerMenuBtn", "dealerPanel", () => {
            if (window.syncDealerUI) {
                window.syncDealerUI();
            }
        });
        this.bindButton("customizeMenuBtn", "customizePanel");
        this.bindButton("statsMenuBtn", "statsPanel", () => {
            if (window.syncStatsUI) {
                window.syncStatsUI();
            }
        });
        this.bindButton("optionsMenuBtn", "optionsPanel");
        this.bindButton("saveMenuBtn", "savePanel");
        this.showPanel("racePanel");
    },
    isRaceBusy() {
        const game = window.Game;
        return (game &&
            (game.countdownActive || game.raceStarted) &&
            !game.raceSummaryVisible);
    },
    bindButton(buttonId, panelId, afterOpen) {
        const button = document.getElementById(buttonId);
        if (!button)
            return;
        button.onclick = () => {
            if (this.isRaceBusy()) {
                this.hideAll();
                return;
            }
            this.showPanel(panelId);
            if (afterOpen) {
                afterOpen();
            }
        };
    },
    hideAll() {
        for (const panelId of this.panels) {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.add("hidden");
            }
        }
    },
    showPanel(panelId) {
        const game = window.Game;
        if (game &&
            (game.raceStarted || game.countdownActive) &&
            !game.raceSummaryVisible) {
            return;
        }
        if (game &&
            game.raceSummaryVisible &&
            !game.raceStarted &&
            !game.countdownActive) {
            game.raceSummaryVisible = false;
            const summary = document.getElementById("raceSummary");
            if (summary) {
                summary.classList.add("hidden");
                summary.style.display = "none";
            }
            const gameCanvas = document.getElementById("gameCanvas");
            const tachCanvas = document.getElementById("tachCanvas");
            if (gameCanvas) {
                gameCanvas.style.display = "none";
            }
            if (tachCanvas) {
                tachCanvas.style.display = "none";
            }
        }
        if (game && game.restoreTestDriveCar && panelId !== "racePanel") {
            game.restoreTestDriveCar();
        }
        this.hideAll();
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.remove("hidden");
            this.showHint(panel, panelId);
        }
        if (panelId === "garagePanel" ||
            panelId === "upgradePanel" ||
            panelId === "customizePanel") {
            const preview = document.getElementById("garagePreviewSlot");
            if (preview) {
                preview.classList.remove("hidden");
            }
        }
    },
    getNextHint(panelId) {
        const hints = this.hints[panelId] || this.hints.default;
        const hint = hints[this.hintIndex % hints.length];
        this.hintIndex++;
        return hint;
    },
    showHint(panel, panelId) {
        if (panelId === "garagePreviewSlot")
            return;
        let hint = panel.querySelector(".menuHint");
        if (!hint) {
            hint = document.createElement("div");
            hint.className = "menuHint";
            const title = panel.querySelector(".panelTitle");
            if (title && title.nextSibling) {
                panel.insertBefore(hint, title.nextSibling);
            }
            else if (title) {
                panel.appendChild(hint);
            }
            else {
                panel.insertBefore(hint, panel.firstChild);
            }
        }
        hint.innerText =
            this.getNextHint(panelId);
    }
};
