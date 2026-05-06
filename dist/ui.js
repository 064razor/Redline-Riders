export const UI = {
    shiftState: "off",
    shiftMessage: "",
    shiftTimer: 0,
    shiftLock: false,
    showCountdown(value) {
        console.log("Countdown:", value);
    },
    init() { },
    update(player, game) {
        document.getElementById("rpm").innerText =
            "RPM: " + Math.round(player.rpm);
        document.getElementById("speed").innerText =
            "Speed: " + Math.round(player.spd * 20) + " MPH";
        document.getElementById("gear").innerText =
            "Gear: " + player.gear;
    },
    triggerShiftFeedback(state) {
        this.shiftState = state;
        this.shiftTimer = 0.8;
    },
    drawTach(car) {
        const canvas = document.getElementById("tachCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    drawShiftIndicator(ctx, x, y) { },
    drawExtras(car) { }
};
