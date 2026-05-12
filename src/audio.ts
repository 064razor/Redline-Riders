import { Options } from "./options.js";

export const AudioSystem = {
    idle: new Audio("public/sounds/idle.wav"),
    rev: new Audio("public/sounds/rev.wav"),

    initialized: false,

    async init() {
        if (this.initialized) return;

        this.idle.loop = true;
        this.rev.loop = true;

        (this.rev as any).preservesPitch = false;
        (this.rev as any).mozPreservesPitch = false;
        (this.rev as any).webkitPreservesPitch = false;

        this.idle.volume = 0.35;
        this.rev.volume = 0.10;

        try {
            await this.idle.play();
            await this.rev.play();

            this.initialized = true;

            console.log("Audio started");
        }
        catch (err) {
            console.warn("Audio failed to start:", err);
        }
    },

    applySettings() {
        if (Options.audioMuted) {
            this.idle.volume = 0;
            this.rev.volume = 0;
        }
    },

    updateEngine(car: any, throttleHeld: boolean) {
        if (!this.initialized) return;

        const rpmRatio =
            Math.min(car.rpm / car.maxRPM, 1);

        const isMoving =
            car.spd > 0.25;

        const masterVolume =
            Options.audioMuted ? 0 : Options.audioVolume;

        const lowRPM =
			rpmRatio <= 0.20;

		// Idle only below 20% RPM
		this.idle.volume =
		lowRPM
			? 0.24 * masterVolume
			: 0;

		// Rev above idle range
		this.rev.volume =
			!lowRPM
				? (0.08 + rpmRatio * 0.42) * masterVolume
				: 0;

        this.rev.playbackRate =
            0.7 + (rpmRatio * 0.4);
			
		this.idle.playbackRate =
            0.7 + (rpmRatio * 0.4);
    },

    stopEngine() {
        if (!this.initialized) return;

        this.idle.volume = 0;
        this.rev.volume = 0;
    }
};