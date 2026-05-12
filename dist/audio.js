var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Options } from "./options.js";
export const AudioSystem = {
    idle: new Audio("public/sounds/idle.wav"),
    rev: new Audio("public/sounds/rev.wav"),
    initialized: false,
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialized)
                return;
            this.idle.loop = true;
            this.rev.loop = true;
            this.rev.preservesPitch = false;
            this.rev.mozPreservesPitch = false;
            this.rev.webkitPreservesPitch = false;
            this.idle.volume = 0.35;
            this.rev.volume = 0.10;
            try {
                yield this.idle.play();
                yield this.rev.play();
                this.initialized = true;
                console.log("Audio started");
            }
            catch (err) {
                console.warn("Audio failed to start:", err);
            }
        });
    },
    applySettings() {
        if (Options.audioMuted) {
            this.idle.volume = 0;
            this.rev.volume = 0;
        }
    },
    updateEngine(car, throttleHeld) {
        if (!this.initialized)
            return;
        const rpmRatio = Math.min(car.rpm / car.maxRPM, 1);
        const isMoving = car.spd > 0.25;
        const masterVolume = Options.audioMuted ? 0 : Options.audioVolume;
        const lowRPM = rpmRatio <= 0.20;
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
        if (!this.initialized)
            return;
        this.idle.volume = 0;
        this.rev.volume = 0;
    }
};
