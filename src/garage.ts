export const Garage = {

    getStarter() {
        return this.getMaruMk5();
    },

    getMaruMk5() {
        return {
            name: "Maru MK-5",
            bodyId: "maruMk5",
            paintColor: "#ffffff",
            rimStyle: "classic5",
			engineLevel: 0,
            tireLevel: 0,
            transmissionLevel: 0,

            enginePrice: 300,
            tirePrice: 250,
            transmissionPrice: 350,

            hp: 120,
            weight: 2400,
            grip: 1,

            spd: 0,
            pos: 0,
            rpm: 1000,
            gear: 1,

            maxRPM: 7000,
            powerbandMin: 4500,
            powerbandMax: 6500,

            gears: 6,
            topSpeed: 132,
            gearRatios: [3.40, 1.95, 1.38, 1.16, 0.99, 0.81],
            gearMaxSpeeds: [
                38,
                62,
                88,
                112,
                124,
                132
            ],
			
            finalDrive: 3.90,

            shiftSpeed: 0.3,
            shiftTimer: 0,
            shiftRPMDrop: false,

            needleColor: "#ff3333",
            hubColor: "#ff3333",
            tachTextColor: "#ffffff",

            wheelspin: false
        };
    },

    getSwagGG2() {
        return {
            name: "Swag GG 2",
            bodyId: "swagGG2",
            paintColor: "#ffffff",
            rimStyle: "classic5",
			
			engineLevel: 0,
            tireLevel: 0,
            transmissionLevel: 0,

            enginePrice: 300,
            tirePrice: 195,
            transmissionPrice: 600,

            hp: 110,
            weight: 2050,
            grip: 0.82,

            spd: 0,
            pos: 0,
            rpm: 1000,
            gear: 1,

            maxRPM: 6100,
            powerbandMin: 3600,
            powerbandMax: 5800,

            gears: 5,
			
			topSpeed: 125,
            gearRatios: [3.45, 1.94, 1.29, 0.97, 0.80],
            gearMaxSpeeds: [
                 34,
                 58,
                 79,
                 101,
                 125
            ],
			
            finalDrive: 3.67,

            shiftSpeed: 0.42,
            shiftTimer: 0,
            shiftRPMDrop: false,

            needleColor: "#ff3333",
            hubColor: "#ff3333",
            tachTextColor: "#ffffff",

            wheelspin: false
        };
    }

};