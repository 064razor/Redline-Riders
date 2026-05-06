console.log("game loaded");

const Game = {
    player: null,
    ai: null,

    state: "idle", // "idle" | "countdown" | "racing" | "finished"
    countdownValue: 3,

    distance: 400,
    difficulty: "normal",

    // ========================
    // START GAME
    // ========================
    start() {
        if (this.state === "countdown" || this.state === "racing") return;

        const baseCar = Garage.getStarter();

        this.player = JSON.parse(JSON.stringify(baseCar));
        this.ai = JSON.parse(JSON.stringify(baseCar));

        // reset stats
        this.player.pos = 0;
        this.ai.pos = 0;

        this.player.spd = 0;
        this.ai.spd = 0;

        this.player.gear = 1;
        this.ai.gear = 1;

        this.player.shiftTimer = 0;
        this.ai.shiftTimer = 0;

        // traction + wheelspin
        this.player.traction = 1;
        this.ai.traction = 1;

        this.player.wheelspin = false;
        this.ai.wheelspin = false;

        // menu settings
        const track = document.getElementById("trackSelect");
        this.distance = track ? parseInt(track.value) : 400;

        const diff = document.getElementById("difficultySelect");
        this.difficulty = diff ? diff.value : "normal";

        // state
        this.state = "countdown";
        this.countdownValue = 3;

        this.runCountdown();
        this.loop();
    },

    // ========================
    // COUNTDOWN
    // ========================
    runCountdown() {
        const el = document.getElementById("countdown");

        el.innerText = this.countdownValue;

        const interval = setInterval(() => {
            this.countdownValue--;

            if (this.countdownValue > 0) {
                el.innerText = this.countdownValue;

            } else if (this.countdownValue === 0) {
                el.innerText = "GO!";

                this.state = "racing";

                // 🔥 launch happens HERE ONLY
                this.handleLaunch(this.player);
                this.handleAILaunch(this.ai);

                setTimeout(() => {
                    el.innerText = "";
                }, 400);

            } else {
                clearInterval(interval);
            }

        }, 800);
    },

    // ========================
    // PLAYER LAUNCH
    // ========================
    handleLaunch(car) {
        const r = car.rpm / car.maxRPM;

        if (r > 0.92 && r < 0.98) {
            car.spd += 8;
            car.traction = 1;
            UI.triggerShiftFeedback("perfect");

        } else if (r > 0.8) {
            car.spd += 6;
            car.traction = 0.9;
            UI.triggerShiftFeedback("good");

        } else if (r > 0.6) {
            car.spd += 3;
            car.traction = 1;
            UI.triggerShiftFeedback("early");

        } else {
            car.spd += 2;
            car.traction = 0.5;
            car.wheelspin = true;
            UI.triggerShiftFeedback("late");
        }
    },

    // ========================
    // AI LAUNCH
    // ========================
    handleAILaunch(car) {
        let variance;

        switch (this.difficulty) {
            case "easy": variance = 0.15; break;
            case "normal": variance = 0.08; break;
            case "hard": variance = 0.03; break;
        }

        const ideal = 0.95;
        const r = ideal + (Math.random() * variance * 2 - variance);

        if (r > 0.92 && r < 0.98) {
            car.spd += 8;
            car.traction = 1;

        } else if (r > 0.8) {
            car.spd += 6;
            car.traction = 0.9;

        } else if (r > 0.6) {
            car.spd += 3;

        } else {
            car.spd += 2;
            car.traction = 0.5;
            car.wheelspin = true;
        }
    },

    // ========================
    // AI SHIFTING
    // ========================
    handleAIShift() {
        const car = this.ai;

        if (this.state !== "racing") return;
        if (car.shiftTimer > 0) return;
        if (car.gear >= car.gearRatios.length) return;

        let r = car.rpm / car.maxRPM;

        let min = 0.9;
        let max = 0.97;

        if (this.difficulty === "easy") {
            min = 0.8;
            max = 0.9;
        }

        if (this.difficulty === "hard") {
            min = 0.92;
            max = 0.98;
        }

        if (r >= min && r <= max) {
            car.gear++;
            car.shiftTimer = 0.35;

            car.rpm *= 0.6;

            const variance = (Math.random() * 0.04) - 0.02;
            car.spd *= (1.05 + variance);
        }
    },

    // ========================
    // GAME LOOP
    // ========================
    loop() {
        if (this.state !== "idle") {
            Render.draw(this.player, this.ai);
            UI.update(this.player, this);
        }

        if (this.state === "racing" || this.state === "countdown") {
            Physics.update(this.player);
            Physics.update(this.ai);

            this.handleAIShift();
        }

        // finish check
        if (this.player.pos >= this.distance || this.ai.pos >= this.distance) {
            this.state = "finished";

            const msg = document.getElementById("shiftMsg");

            if (this.player.pos > this.ai.pos) {
                msg.innerText = "You Win!";
            } else {
                msg.innerText = "You Lose!";
            }

            return;
        }

        requestAnimationFrame(() => this.loop());
    }
};