export const UI = {
    shiftState: "off",
    shiftMessage: "",
    shiftTimer: 0,
    shiftLock: false,

    showCountdown(value: any) {
        console.log("Countdown:", value);
    },

    init() {},

    update(player: any, game: any) {
        document.getElementById("rpm")!.innerText =
            "RPM: " + Math.round(player.rpm);

        document.getElementById("speed")!.innerText =
            "Speed: " + Math.round(player.spd * 20) + " MPH";

        document.getElementById("gear")!.innerText =
            "Gear: " + player.gear;
    },

    triggerShiftFeedback(state: any) {
        this.shiftState = state;
        this.shiftTimer = 0.8;
    },

    drawTach(car: any) {
        const canvas = document.getElementById("tachCanvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d")!;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    drawShiftIndicator(ctx: any, x: any, y: any) {},

    drawExtras(car: any) {}
};