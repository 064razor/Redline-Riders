export const Menu = {
    panels: [
        "racePanel",
        "garagePreviewSlot",
        "garagePanel",
        "upgradePanel",
        "dealerPanel",
        "customizePanel",
        "optionsPanel",
        "savePanel"
    ],

    init() {
        this.bindButton("raceMenuBtn", "racePanel");
        this.bindButton("garageMenuBtn", "garagePanel");
		this.bindButton("upgradeMenuBtn", "upgradePanel");

        this.bindButton("dealerMenuBtn", "dealerPanel", () => {
            if ((window as any).syncDealerUI) {
                (window as any).syncDealerUI();
            }
        });

        this.bindButton("customizeMenuBtn", "customizePanel");
        this.bindButton("optionsMenuBtn", "optionsPanel");
        this.bindButton("saveMenuBtn", "savePanel");

        this.showPanel("racePanel");
    },

    isRaceBusy() {
		const game = (window as any).Game;

		return (
			game &&
			(game.countdownActive || game.raceStarted) &&
			!game.raceSummaryVisible
		);
	},

    bindButton(buttonId: string, panelId: string, afterOpen?: () => void) {
        const button = document.getElementById(buttonId) as HTMLButtonElement;
        if (!button) return;

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

    showPanel(panelId: string) {
    const game = (window as any).Game;

    if (
        game &&
        (game.raceStarted || game.countdownActive) &&
        !game.raceSummaryVisible
    ) {
        return;
    }

if (
    game &&
    game.raceSummaryVisible &&
    !game.raceStarted &&
    !game.countdownActive
) {
    game.raceSummaryVisible = false;

    const summary =
        document.getElementById("raceSummary");

    if (summary) {
        summary.classList.add("hidden");
        summary.style.display = "none";
    }

    const gameCanvas =
        document.getElementById("gameCanvas") as HTMLCanvasElement;

    const tachCanvas =
        document.getElementById("tachCanvas") as HTMLCanvasElement;

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
    }

    if (
        panelId === "garagePanel" ||
        panelId === "upgradePanel" ||
        panelId === "customizePanel"
    ) {
        const preview =
            document.getElementById("garagePreviewSlot");

        if (preview) {
            preview.classList.remove("hidden");
        }
    }
}

};
