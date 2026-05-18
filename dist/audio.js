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
    idleVolume: 0.24,
    revVolume: 0.42,
    minRate: 0.72,
    rateRange: 0.44
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
    rouletteBlair: {
        idle: "public/sounds/roulette-blair-idle.wav",
        rev: "public/sounds/roulette-blair-rev.wav",
        idleVolume: 0.32,
        revVolume: 0.48,
        minRate: 0.66,
        rateRange: 0.34
    },
    rouletteMontBlanc: {
        idle: "public/sounds/roulette-mont-blanc-idle.wav",
        rev: "public/sounds/roulette-mont-blanc-rev.wav",
        idleVolume: 0.28,
        revVolume: 0.44,
        minRate: 0.7,
        rateRange: 0.38
    },
    hannaCivilian: {
        idle: "public/sounds/hanna-civilian-idle.wav",
        rev: "public/sounds/hanna-civilian-rev.wav",
        idleVolume: 0.22,
        revVolume: 0.40,
        minRate: 0.78,
        rateRange: 0.52
    }
};
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
function updateEngineChannel(idle, rev, profile, car, volumeScale) {
    const rpmRatio = Math.min(car.rpm / car.maxRPM, 1);
    const masterVolume = Options.audioMuted ? 0 : Options.audioVolume * volumeScale;
    const lowRPM = rpmRatio <= 0.20;
    idle.volume =
        lowRPM
            ? profile.idleVolume * masterVolume
            : 0;
    rev.volume =
        !lowRPM
            ? (0.08 + rpmRatio * profile.revVolume) * masterVolume
            : 0;
    const rate = profile.minRate +
        rpmRatio * profile.rateRange;
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
    const bassOsc = context.createOscillator();
    const bassGain = context.createGain();
    turboOsc.type = "sine";
    turboOsc.frequency.value = 900;
    turboGain.gain.value = 0;
    turboOsc.connect(turboGain);
    turboGain.connect(context.destination);
    turboOsc.start();
    superOsc.type = "sawtooth";
    superOsc.frequency.value = 260;
    superGain.gain.value = 0;
    superOsc.connect(superGain);
    superGain.connect(context.destination);
    superOsc.start();
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
    master.gain.setValueAtTime(0.045 * Options.audioVolume * volumeScale, now);
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
        gain.gain.linearRampToValueAtTime(0.8, start + 0.01);
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
            ? masterVolume * Math.min(0.075, turboSpool * 0.045 + boostPsi * 0.004)
            : 0;
        const superVolume = inductionType === "supercharger"
            ? masterVolume * (0.018 + rpmRatio * 0.038)
            : 0;
        const bassVolume = inductionType === "displacement"
            ? masterVolume * (0.012 + rpmRatio * 0.018)
            : 0;
        channel.turboOsc.frequency.setTargetAtTime(850 + rpmRatio * 1650 + turboSpool * 1300, context.currentTime, 0.04);
        channel.superOsc.frequency.setTargetAtTime(190 + rpmRatio * 920, context.currentTime, 0.035);
        channel.bassOsc.frequency.setTargetAtTime(55 + rpmRatio * 72, context.currentTime, 0.05);
        channel.turboGain.gain.setTargetAtTime(turboVolume, context.currentTime, 0.04);
        channel.superGain.gain.setTargetAtTime(superVolume, context.currentTime, 0.04);
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
        updateEngineChannel(this.idle, this.rev, this.currentProfile, car, 1);
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
        if (Options.audioMuted)
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
        masterGain.gain.linearRampToValueAtTime(0.08 * Options.audioVolume, startTime + 0.025);
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
