export const SaveSystem = {

    currentSlot: 1,

    getKey(slot: number) {
        return "redline_save_slot_" + slot;
    },

    save(game: any, slot: number = this.currentSlot) {
        const saveData = {
            money: game.money,
            ownedCars: game.ownedCars,
            selectedCarId: game.playerCar.bodyId,
            garageCars: game.garageCars
        };

        localStorage.setItem(
            this.getKey(slot),
            JSON.stringify(saveData)
        );

        this.currentSlot = slot;
        localStorage.setItem("redline_current_slot", String(slot));
    },

    load(slot: number = this.currentSlot) {
        const raw =
            localStorage.getItem(this.getKey(slot));

        if (!raw) return null;

        this.currentSlot = slot;
        localStorage.setItem("redline_current_slot", String(slot));

        return JSON.parse(raw);
    },

    loadCurrentSlot() {
        const savedSlot =
            Number(localStorage.getItem("redline_current_slot"));

        if (savedSlot >= 1 && savedSlot <= 5) {
            this.currentSlot = savedSlot;
        }

        return this.load(this.currentSlot);
    },

    hasSave(slot: number) {
        return localStorage.getItem(this.getKey(slot)) !== null;
    },

    deleteSave(slot: number) {
        localStorage.removeItem(this.getKey(slot));
    }
};