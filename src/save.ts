import { Options } from "./options.js";

export const SaveSystem = {

    currentSlot: 1,
    profileCount: 5,
    autosaveSlot: 0,

    getAutosaveKey() {
        return "redline_autosave";
    },

    getKey(slot: number) {
        return "redline_save_slot_" + slot;
    },

    getStorageKey(slot: number) {
        return slot === this.autosaveSlot
            ? this.getAutosaveKey()
            : this.getKey(slot);
    },

    getDefaultProfileName(slot: number) {
        return slot === this.autosaveSlot
            ? "Autosave"
            : "Profile " + slot;
    },

    getEmptyProfile(slot: number) {
        return {
            slot,
            name: this.getDefaultProfileName(slot),
            savedAt: "",
            hasSave: false,
            autosave: slot === this.autosaveSlot
        };
    },

    createSaveData(game: any, profileName = "") {
        return {
            version: 2,
            profileName,
            savedAt: new Date().toISOString(),
            money: game.money,
            stats: game.normalizeStats
                ? game.normalizeStats(game.stats)
                : game.stats,
            completedEvents: game.completedEvents || {},
            ownedCars: game.ownedCars,
            selectedCarId: game.playerCar.bodyId,
            garageCars: game.garageCars,

            options: {
                speedUnit: Options.speedUnit,
                torqueUnit: Options.torqueUnit,
                weightUnit: Options.weightUnit,
                lane: Options.lane,
                raceDirection: Options.raceDirection,
                audioMuted: Options.audioMuted,
                audioVolume: Options.audioVolume,
                menuAudioVolume: Options.menuAudioVolume,
                opponentAudioVolume: Options.opponentAudioVolume,
                boostUnit: Options.boostUnit
            }
        };
    },

    save(game: any, slot?: number, profileName = "") {
        const targetSlot =
            slot ?? this.autosaveSlot;

        const existing = this.loadRaw(targetSlot);
        const resolvedName =
            targetSlot === this.autosaveSlot
                ? "Autosave"
                : profileName || existing?.profileName || this.getDefaultProfileName(targetSlot);

        const saveData =
            this.createSaveData(game, resolvedName);

        localStorage.setItem(
            this.getStorageKey(targetSlot),
            JSON.stringify(saveData)
        );

        if (targetSlot !== this.autosaveSlot) {
            this.currentSlot = targetSlot;
            localStorage.setItem("redline_current_slot", String(targetSlot));
        }

        return saveData;
    },

    loadRaw(slot: number = this.currentSlot) {
        const raw =
            localStorage.getItem(this.getStorageKey(slot));

        if (!raw) return null;

        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    },

    load(slot: number = this.currentSlot) {
        const save = this.loadRaw(slot);

        if (!save) return null;

        if (slot !== this.autosaveSlot) {
            this.currentSlot = slot;
            localStorage.setItem("redline_current_slot", String(slot));
        }

        return save;
    },

    loadCurrentSlot() {
        const savedSlot =
            Number(localStorage.getItem("redline_current_slot"));

        if (savedSlot >= 1 && savedSlot <= this.profileCount) {
            this.currentSlot = savedSlot;
        }

        return this.load(this.currentSlot);
    },

    hasSave(slot: number) {
        return localStorage.getItem(this.getStorageKey(slot)) !== null;
    },

    getProfile(slot: number) {
        const save = this.loadRaw(slot);

        if (!save) return this.getEmptyProfile(slot);

        return {
            slot,
            name: slot === this.autosaveSlot ? "Autosave" : save.profileName || this.getDefaultProfileName(slot),
            savedAt: save.savedAt || "",
            hasSave: true,
            autosave: slot === this.autosaveSlot
        };
    },

    getProfiles() {
        const profiles = [this.getProfile(this.autosaveSlot)];

        for (let slot = 1; slot <= this.profileCount; slot++) {
            profiles.push(this.getProfile(slot));
        }

        return profiles;
    },

    rename(slot: number, name: string) {
        if (slot === this.autosaveSlot) return null;

        const save = this.loadRaw(slot);

        if (!save) return null;

        save.profileName =
            name.trim() || this.getDefaultProfileName(slot);

        localStorage.setItem(
            this.getStorageKey(slot),
            JSON.stringify(save)
        );

        return save;
    },

    importSave(slot: number, saveData: any, profileName = "") {
        if (slot === this.autosaveSlot) {
            throw new Error("Autosave is load-only.");
        }

        if (!saveData || typeof saveData !== "object") {
            throw new Error("Invalid save file.");
        }

        if (!saveData.garageCars || !saveData.selectedCarId) {
            throw new Error("This does not look like a Redline Riders save.");
        }

        saveData.profileName =
            profileName.trim() ||
            saveData.profileName ||
            this.getDefaultProfileName(slot);

        saveData.savedAt =
            saveData.savedAt || new Date().toISOString();

        localStorage.setItem(
            this.getStorageKey(slot),
            JSON.stringify(saveData)
        );

        this.currentSlot = slot;
        localStorage.setItem("redline_current_slot", String(slot));

        return saveData;
    },

    exportSave(slot: number) {
        if (slot === this.autosaveSlot) return null;

        return this.loadRaw(slot);
    },

    deleteSave(slot: number) {
        if (slot === this.autosaveSlot) return;

        localStorage.removeItem(this.getStorageKey(slot));
    }
};
