export const Menu = {
    panels: [
        "racePanel",
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
        return game && (game.countdownActive || game.raceStarted);
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
        this.hideAll();

        const summary = document.getElementById("raceSummary");
        if (summary) {
        summary.classList.add("hidden");
        summary.style.display = "none";
    }

    const game = (window as any).Game;
    if (game) {
        game.raceSummaryVisible = false;
    }

    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.remove("hidden");
    }
}

};