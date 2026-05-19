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
const defaultProfile = {
    idle: "public/sounds/maru-mk5-idle.wav",
    rev: "public/sounds/maru-mk5-rev.wav",
    idleVolume: 0.20,
    revVolume: 0.34,
    minRate: 0.62,
    rateRange: 0.58
};
const engineSoundProfiles = {
    maruMk5: defaultProfile,
    swagGG2: {
        idle: "public/sounds/idle.wav",
        rev: "public/sounds/rev.wav",
        idleVolume: 0.24,
        revVolume: 0.42,
        minRate: 0.7,
        rateRange: 0.4
    },
    swagLadybug2024: {
        idle: "public/sounds/hanna-civilian-idle.wav",
        rev: "public/sounds/hanna-civilian-rev.wav",
        idleVolume: 0.19,
        revVolume: 0.34,
        minRate: 0.62,
        rateRange: 0.46
    },
    scholarVibratio: {
        idle: "public/sounds/hanna-civilian-idle.wav",
        rev: "public/sounds/hanna-civilian-rev.wav",
        idleVolume: 0.21,
        revVolume: 0.36,
        minRate: 0.62,
        rateRange: 0.48
    },
    rouletteBlair: {
        idle: "public/sounds/roulette-blair-idle.wav",
        rev: "public/sounds/roulette-blair-rev.wav",
        idleVolume: 0.28,
        revVolume: 0.42,
        minRate: 0.64,
        rateRange: 0.38
    },
    rouletteMontBlanc: {
        idle: "public/sounds/roulette-mont-blanc-idle.wav",
        rev: "public/sounds/roulette-mont-blanc-rev.wav",
        idleVolume: 0.24,
        revVolume: 0.38,
        minRate: 0.64,
        rateRange: 0.42
    },
    hannaCivilian: {
        idle: "public/sounds/hanna-civilian-idle.wav",
        rev: "public/sounds/hanna-civilian-rev.wav",
        idleVolume: 0.22,
        revVolume: 0.44,
        minRate: 0.66,
        rateRange: 0.60
    }
};
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}
function configureEngineLoop(idle, rev) {
    idle.loop = true;
    rev.loop = true;
    rev.preservesPitch = false;
    rev.mozPreservesPitch = false;
    rev.webkitPreservesPitch = false;
    idle.preservesPitch = false;
    idle.mozPreservesPitch = false;
    idle.webkitPreservesPitch = false;
}
function applyEngineSound(idle, rev, car, currentBodyId, initialized) {
    const bodyId = (car === null || car === void 0 ? void 0 : car.bodyId) || "maruMk5";
    if (bodyId === currentBodyId) {
        return {
            bodyId,
            profile: engineSoundProfiles[bodyId] || defaultProfile
        };
    }
    const wasIdlePlaying = !idle.paused;
    const wasRevPlaying = !rev.paused;
    const profile = engineSoundProfiles[bodyId] || defaultProfile;
    idle.src = profile.idle;
    rev.src = profile.rev;
    configureEngineLoop(idle, rev);
    idle.load();
    rev.load();
    if (initialized || wasIdlePlaying) {
        idle.play().catch(() => { });
    }
    if (initialized || wasRevPlaying) {
        rev.play().catch(() => { });
    }
    return { bodyId, profile };
}
function updateEngineChannel(idle, rev, profile, car, volumeScale, throttleHeld = true) {
    const rpmRatio = clamp(car.rpm / car.maxRPM, 0, 1);
    const masterVolume = Options.audioMuted ? 0 : Options.audioVolume * volumeScale;
    const idleBlend = clamp((0.34 - rpmRatio) / 0.24, 0, 1);
    const revBlend = clamp((rpmRatio - 0.10) / 0.24, 0, 1);
    const throttleVolume = throttleHeld ? 1 : 0.68;
    idle.volume =
        profile.idleVolume * idleBlend * masterVolume;
    rev.volume =
        (0.045 + rpmRatio * profile.revVolume) *
            revBlend *
            throttleVolume *
            masterVolume;
    const rate = profile.minRate +
        rpmRatio * profile.rateRange;
    rev.preservesPitch = false;
    rev.mozPreservesPitch = false;
    rev.webkitPreservesPitch = false;
    idle.preservesPitch = false;
    idle.mozPreservesPitch = false;
    idle.webkitPreservesPitch = false;
    rev.playbackRate = rate;
    idle.playbackRate = rate;
}
function getAudioContextConstructor() {
    return window.AudioContext ||
        window.webkitAudioContext;
}
function createInductionChannel(context) {
    const turboOsc = context.createOscillator();
    const turboGain = context.createGain();
    const superOsc = context.createOscillator();
    const superGain = context.createGain();
    const superTextureOsc = context.createOscillator();
    const superTextureGain = context.createGain();
    const superTextureFilter = context.createBiquadFilter();
    const bassOsc = context.createOscillator();
    const bassGain = context.createGain();
    turboOsc.type = "sine";
    turboOsc.frequency.value = 900;
    turboGain.gain.value = 0;
    turboOsc.connect(turboGain);
    turboGain.connect(context.destination);
    turboOsc.start();
    superOsc.type = "triangle";
    superOsc.frequency.value = 260;
    superGain.gain.value = 0;
    superOsc.connect(superGain);
    superGain.connect(context.destination);
    superOsc.start();
    superTextureOsc.type = "sawtooth";
    superTextureOsc.frequency.value = 530;
    superTextureGain.gain.value = 0;
    superTextureFilter.type = "bandpass";
    superTextureFilter.frequency.value = 1450;
    superTextureFilter.Q.value = 2.4;
    superTextureOsc.connect(superTextureFilter);
    superTextureFilter.connect(superTextureGain);
    superTextureGain.connect(context.destination);
    superTextureOsc.start();
    bassOsc.type = "sine";
    bassOsc.frequency.value = 85;
    bassGain.gain.value = 0;
    bassOsc.connect(bassGain);
    bassGain.connect(context.destination);
    bassOsc.start();
    return {
        turboOsc,
        turboGain,
        superOsc,
        superGain,
        superTextureOsc,
        superTextureGain,
        superTextureFilter,
        bassOsc,
        bassGain,
        lastShiftTimer: 0
    };
}
function playTurboFlutter(context, volumeScale) {
    if (Options.audioMuted || Options.audioVolume <= 0)
        return;
    const now = context.currentTime;
    const master = context.createGain();
    master.gain.setValueAtTime(0.023 * Options.audioVolume * volumeScale, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    master.connect(context.destination);
    for (let i = 0; i < 3; i++) {
        const osc = context.createOscillator();
        const gain = context.createGain();
        const start = now + i * 0.045;
        osc.type = "square";
        osc.frequency.setValueAtTime(520 - i * 80, start);
        osc.frequency.exponentialRampToValueAtTime(260 - i * 35, start + 0.08);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.50, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(start + 0.09);
    }
}
export const AudioSystem = {
    idle: new Audio(defaultProfile.idle),
    rev: new Audio(defaultProfile.rev),
    opponentIdle: new Audio(defaultProfile.idle),
    opponentRev: new Audio(defaultProfile.rev),
    uiHover: new Audio("public/sounds/ui-hover.wav"),
    uiSelect: new Audio("public/sounds/ui-select.wav"),
    uiPurchase: new Audio("public/sounds/ui-purchase.wav"),
    countdownLow: new Audio("public/sounds/countdown-low.wav"),
    countdownHigh: new Audio("public/sounds/countdown-high.wav"),
    currentBodyId: "maruMk5",
    currentOpponentBodyId: "maruMk5",
    currentProfile: defaultProfile,
    currentOpponentProfile: defaultProfile,
    opponentVolumeScale: 0.15,
    initialized: false,
    uiAudioContext: null,
    inductionAudioContext: null,
    playerInductionChannel: null,
    opponentInductionChannel: null,
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialized)
                return;
            this.configureLoops();
            try {
                yield this.idle.play();
                yield this.rev.play();
                yield this.opponentIdle.play();
                yield this.opponentRev.play();
                this.initialized = true;
                console.log("Audio started");
            }
            catch (err) {
                console.warn("Audio failed to start:", err);
            }
        });
    },
    configureLoops() {
        configureEngineLoop(this.idle, this.rev);
        configureEngineLoop(this.opponentIdle, this.opponentRev);
        this.uiHover.preload = "auto";
        this.uiSelect.preload = "auto";
        this.uiPurchase.preload = "auto";
        this.countdownLow.preload = "auto";
        this.countdownHigh.preload = "auto";
    },
    playUISound(sound, volume = 1) {
        if (Options.audioMuted || Options.menuAudioVolume <= 0)
            return;
        const instance = sound.cloneNode(true);
        instance.volume =
            Math.max(0, Math.min(Options.menuAudioVolume * volume, 1));
        instance.play().catch(() => { });
    },
    playHover() {
        this.playUISound(this.uiHover, 0.24);
    },
    playSelect() {
        this.playUISound(this.uiSelect, 0.38);
    },
    playPurchase() {
        this.playUISound(this.uiPurchase, 0.52);
    },
    playCountdownBeep(high = false) {
        this.playUISound(high ? this.countdownHigh : this.countdownLow, high ? 0.09 : 0.08);
    },
    setEngineSound(car) {
        const result = applyEngineSound(this.idle, this.rev, car, this.currentBodyId, this.initialized);
        this.currentBodyId = result.bodyId;
        this.currentProfile = result.profile;
    },
    setOpponentEngineSound(car) {
        const result = applyEngineSound(this.opponentIdle, this.opponentRev, car, this.currentOpponentBodyId, this.initialized);
        this.currentOpponentBodyId = result.bodyId;
        this.currentOpponentProfile = result.profile;
    },
    applySettings() {
        if (Options.audioMuted) {
            this.idle.volume = 0;
            this.rev.volume = 0;
            this.opponentIdle.volume = 0;
            this.opponentRev.volume = 0;
            this.setInductionChannelVolume(this.playerInductionChannel, 0);
            this.setInductionChannelVolume(this.opponentInductionChannel, 0);
        }
    },
    ensureInductionAudio() {
        const AudioContextConstructor = getAudioContextConstructor();
        if (!AudioContextConstructor)
            return null;
        if (!this.inductionAudioContext) {
            this.inductionAudioContext = new AudioContextConstructor();
        }
        if (this.inductionAudioContext.state === "suspended") {
            this.inductionAudioContext.resume().catch(() => { });
        }
        if (!this.playerInductionChannel) {
            this.playerInductionChannel =
                createInductionChannel(this.inductionAudioContext);
        }
        if (!this.opponentInductionChannel) {
            this.opponentInductionChannel =
                createInductionChannel(this.inductionAudioContext);
        }
        return this.inductionAudioContext;
    },
    setInductionChannelVolume(channel, volume) {
        if (!channel)
            return;
        const context = this.inductionAudioContext;
        if (!context)
            return;
        channel.turboGain.gain.setTargetAtTime(volume, context.currentTime, 0.03);
        channel.superGain.gain.setTargetAtTime(volume, context.currentTime, 0.03);
        channel.superTextureGain.gain.setTargetAtTime(volume, context.currentTime, 0.03);
        channel.bassGain.gain.setTargetAtTime(volume, context.currentTime, 0.03);
    },
    updateInductionSound(car, channel, volumeScale) {
        if (!channel || !this.inductionAudioContext)
            return;
        const context = this.inductionAudioContext;
        const masterVolume = Options.audioMuted ? 0 : Options.audioVolume * volumeScale;
        const rpmRatio = Math.max(0, Math.min(((car === null || car === void 0 ? void 0 : car.rpm) || 1000) / ((car === null || car === void 0 ? void 0 : car.maxRPM) || 7000), 1));
        const inductionType = (car === null || car === void 0 ? void 0 : car.forcedInductionType) || "none";
        const boostPsi = Math.max(0, (car === null || car === void 0 ? void 0 : car.boostPsi) || 0);
        const turboSpool = Math.max(0, Math.min((car === null || car === void 0 ? void 0 : car.turboSpool) || 0, 1));
        const turboVolume = inductionType === "turbo"
            ? masterVolume * Math.min(0.040, turboSpool * 0.024 + boostPsi * 0.0021)
            : 0;
        const superVolume = inductionType === "supercharger"
            ? masterVolume * (0.009 + rpmRatio * 0.016)
            : 0;
        const superTextureVolume = inductionType === "supercharger"
            ? masterVolume * (0.0025 + rpmRatio * 0.007)
            : 0;
        const bassVolume = inductionType === "displacement"
            ? masterVolume * (0.012 + rpmRatio * 0.018)
            : 0;
        channel.turboOsc.frequency.setTargetAtTime(760 + rpmRatio * 1350 + turboSpool * 980, context.currentTime, 0.04);
        channel.superOsc.frequency.setTargetAtTime(170 + rpmRatio * 760, context.currentTime, 0.035);
        channel.superTextureOsc.frequency.setTargetAtTime((170 + rpmRatio * 760) * 2.08, context.currentTime, 0.035);
        channel.superTextureFilter.frequency.setTargetAtTime(950 + rpmRatio * 1750, context.currentTime, 0.04);
        channel.bassOsc.frequency.setTargetAtTime(55 + rpmRatio * 72, context.currentTime, 0.05);
        channel.turboGain.gain.setTargetAtTime(turboVolume, context.currentTime, 0.04);
        channel.superGain.gain.setTargetAtTime(superVolume, context.currentTime, 0.04);
        channel.superTextureGain.gain.setTargetAtTime(superTextureVolume, context.currentTime, 0.035);
        channel.bassGain.gain.setTargetAtTime(bassVolume, context.currentTime, 0.05);
        const shiftTimer = (car === null || car === void 0 ? void 0 : car.shiftTimer) || 0;
        if (inductionType === "turbo" &&
            shiftTimer > 0 &&
            channel.lastShiftTimer <= 0 &&
            turboSpool > 0.18) {
            playTurboFlutter(context, volumeScale);
        }
        channel.lastShiftTimer =
            shiftTimer;
    },
    updateEngine(car, throttleHeld) {
        if (!this.initialized)
            return;
        this.ensureInductionAudio();
        this.setEngineSound(car);
        updateEngineChannel(this.idle, this.rev, this.currentProfile, car, 1, throttleHeld);
        this.updateInductionSound(car, this.playerInductionChannel, 1);
    },
    updateOpponentEngine(car) {
        if (!this.initialized)
            return;
        this.ensureInductionAudio();
        this.setOpponentEngineSound(car);
        updateEngineChannel(this.opponentIdle, this.opponentRev, this.currentOpponentProfile, car, Options.opponentAudioVolume);
        this.updateInductionSound(car, this.opponentInductionChannel, Options.opponentAudioVolume);
    },
    stopEngine() {
        if (!this.initialized)
            return;
        this.idle.volume = 0;
        this.rev.volume = 0;
        this.setInductionChannelVolume(this.playerInductionChannel, 0);
    },
    stopOpponentEngine() {
        if (!this.initialized)
            return;
        this.opponentIdle.volume = 0;
        this.opponentRev.volume = 0;
        this.setInductionChannelVolume(this.opponentInductionChannel, 0);
    },
    stopAllEngines() {
        this.stopEngine();
        this.stopOpponentEngine();
    },
    playSaveChime() {
        if (Options.audioMuted || Options.menuAudioVolume <= 0)
            return;
        const AudioContextConstructor = getAudioContextConstructor();
        if (!AudioContextConstructor)
            return;
        if (!this.uiAudioContext) {
            this.uiAudioContext = new AudioContextConstructor();
        }
        const context = this.uiAudioContext;
        if (context.state === "suspended") {
            context.resume().catch(() => { });
        }
        const startTime = context.currentTime;
        const masterGain = context.createGain();
        masterGain.gain.setValueAtTime(0, startTime);
        masterGain.gain.linearRampToValueAtTime(0.08 * Options.menuAudioVolume, startTime + 0.025);
        masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
        masterGain.connect(context.destination);
        const notes = [
            { frequency: 659.25, offset: 0 },
            { frequency: 987.77, offset: 0.07 }
        ];
        for (const note of notes) {
            const oscillator = context.createOscillator();
            const noteGain = context.createGain();
            const noteStart = startTime + note.offset;
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(note.frequency, noteStart);
            noteGain.gain.setValueAtTime(0, noteStart);
            noteGain.gain.linearRampToValueAtTime(0.9, noteStart + 0.018);
            noteGain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.32);
            oscillator.connect(noteGain);
            noteGain.connect(masterGain);
            oscillator.start(noteStart);
            oscillator.stop(noteStart + 0.36);
        }
    }
};
