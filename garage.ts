function calculateTopSpeed(
    maxRPM: number,
    topGearRatio: number,
    finalDrive: number
) {
    return Math.floor(
        maxRPM / (topGearRatio * finalDrive * 330) * 20
    );
}

function calculateGearMaxSpeeds(
    maxRPM: number,
    gearRatios: number[],
    finalDrive: number
) {
    return gearRatios.map((ratio) =>
        Math.floor(maxRPM / (ratio * finalDrive * 330)) * 20
    );
}

export function refreshDrivetrain(car: any) {

    car.topSpeed = calculateTopSpeed(
        car.maxRPM,
        car.gearRatios[car.gearRatios.length - 1],
        car.finalDrive
    );

    car.gearMaxSpeeds = calculateGearMaxSpeeds(
        car.maxRPM,
        car.gearRatios,
        car.finalDrive
    );
}

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
			exhaustLevel: 0,
            ecuLevel: 0,
            weightReductionLevel: 0,
            suspensionLevel: 0,
            flywheelLevel: 0,
			pistonLevel: 0,
			crankLevel: 0,
			intakeLevel: 0,
			topEndLevel: 0,
			bottomEndLevel: 0,

            enginePrice: 1400,
            tirePrice: 230,
            transmissionPrice: 350,
			exhaustPrice: 180,
            ecuPrice: 260,
            weightReductionPrice: 320,
            suspensionPrice: 195,
            flywheelPrice: 300,
			pistonPrice: 450,
			crankPrice: 500,
			intakePrice: 300,
			topEndPrice: 650,
			bottomEndPrice: 750,

            hp: 120,
			torque: 115,
            weight: 2400,
			baseWeight: 2400,
            grip: 1,
			launchGrip: 4.5,

            spd: 0,
            pos: 0,
            rpm: 1000,
            gear: 1,

            maxRPM: 7000,
            powerbandMin: 4500,
            powerbandMax: 6500,

            gears: 6,
topSpeed: calculateTopSpeed(
    7000,
    0.88,
    3.85
),

gearRatios: [
    2.65,
    1.50,
    0.95,
    0.62,
    0.44,
    0.41
],

gearMaxSpeeds: calculateGearMaxSpeeds(
    7000,
    [
        3.25,
        2.10,
        1.55,
        1.22,
        1.00,
        0.78
    ],
    3.85
),

finalDrive: 3.85,
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
			exhaustLevel: 0,
            ecuLevel: 0,
            weightReductionLevel: 0,
            suspensionLevel: 0,
            flywheelLevel: 0,
			pistonLevel: 0,
			crankLevel: 0,
			intakeLevel: 0,
			topEndLevel: 0,
			bottomEndLevel: 0,

            tirePrice: 195,
            transmissionPrice: 600,
			enginePrice: 1400,
			exhaustPrice: 130,
            ecuPrice: 275,
            weightReductionPrice: 300,
            suspensionPrice: 150,
            flywheelPrice: 340,
			pistonPrice: 450,
			crankPrice: 500,
			intakePrice: 300,
			topEndPrice: 650,
			bottomEndPrice: 750,

            hp: 110,
			torque: 105,
            weight: 2050,
			baseWeight: 2050,
            grip: 0.82,
			launchGrip: 4.5,

            spd: 0,
            pos: 0,
            rpm: 1000,
            gear: 1,

            maxRPM: 6100,
            powerbandMin: 3600,
            powerbandMax: 5800,

            gears: 5,
			
			topSpeed: calculateTopSpeed(
               6100,
               0.80,
               3.57
            ),
			
            gearRatios: [3.15, 1.64, 0.99, 0.67, 0.53],
            
			gearMaxSpeeds: calculateGearMaxSpeeds(
                6100,
                [3.45, 1.94, 1.29, 0.97, 0.80],
                3.57
            ),
			
            finalDrive: 2.57,
            shiftSpeed: 0.42,
            shiftTimer: 0,
            shiftRPMDrop: false,

            needleColor: "#ff3333",
            hubColor: "#ff3333",
            tachTextColor: "#ffffff",

            wheelspin: false
        };
    },
	
	getRouletteBlair() {
		
    return {
        name: "Roulette Blair",
        bodyId: "rouletteBlair",
        paintColor: "#ffffff",
        rimStyle: "classic5",
		
		engineLevel: 0,
        tireLevel: 0,
        transmissionLevel: 0,
		exhaustLevel: 0,
        ecuLevel: 0,
        weightReductionLevel: 0,
        suspensionLevel: 0,
        flywheelLevel: 0,

        enginePrice: 1575,
        tirePrice: 700,
        transmissionPrice: 350,
		exhaustPrice: 180,
        ecuPrice: 360,
        weightReductionPrice: 520,
        suspensionPrice: 250,
        flywheelPrice: 300,
		pistonPrice: 450,
		crankPrice: 500,
		intakePrice: 300,
		topEndPrice: 650,
		bottomEndPrice: 750,

        hp: 285,
		torque: 340,
        weight: 4131,
		baseWeight: 4131,
        grip: 0.52,
		launchGrip: 2.5,

        spd: 0,
        pos: 0,
        rpm: 1000,
        gear: 1,

        maxRPM: 5400,

        powerbandMin: 2200,
        powerbandMax: 4700,

        gears: 4,

        topSpeed: calculateTopSpeed(
           5400,
           0.92,
           2.07
        ),

        gearRatios: [
            2.20,
            1.52,
            0.88,
            0.62
        ],

        gearMaxSpeeds: calculateGearMaxSpeeds(
            5400,
            [2.60, 1.72, 1.18, 0.92],
            2.07
        ),

        finalDrive: 1.57,
        shiftSpeed: 0.62,
        shiftTimer: 0,
        shiftRPMDrop: false,

        needleColor: "#ff3333",
        hubColor: "#ff3333",
        tachTextColor: "#ffffff",

        wheelspin: false
    };
},

    getRouletteMontBlanc() {

    const car = {

        id: "rouletteMontBlanc",
		bodyId: "rouletteMontBlanc",
		paintColor: "#ffffff",
		rimStyle: "deepDish",

        name: "Roulette Mont Blanc",

        hp: 205,
        torque: 265,

        weight: 3400,
        grip: 0.59,

        maxRPM: 5600,

        powerbandMin: 2600,
        powerbandMax: 5000,
		
		gears: 5,

        topSpeed: calculateTopSpeed(
			5600,
			0.78,
			2.73
		),

		gearRatios: [
			2.52,
			1.68,
			1.29,
			1.00,
			0.73
		],

        finalDrive: 2.73,
        rpmFinalDrive: 3.15,

        gear: 1,
        rpm: 1000,
        spd: 0,
        pos: 0,

        shiftTimer: 0,
        shiftRPMDrop: false,
        wheelspin: false,

        price: 8500,

        engineLevel: 0,
        tireLevel: 0,
        transmissionLevel: 0,
        exhaustLevel: 0,
        ecuLevel: 0,
        weightReductionLevel: 0,
        suspensionLevel: 0,
        flywheelLevel: 0,

        pistonLevel: 0,
        crankLevel: 0,
        intakeLevel: 0,
        topEndLevel: 0,
        bottomEndLevel: 0,

        enginePrice: 400,
        tirePrice: 230,
        transmissionPrice: 350,
        exhaustPrice: 180,
        ecuPrice: 260,
        weightReductionPrice: 320,
        suspensionPrice: 195,
        flywheelPrice: 300,

        pistonPrice: 450,
        crankPrice: 500,
        intakePrice: 300,
        topEndPrice: 650,
        bottomEndPrice: 750,

        needleColor: "#ff3333",
        hubColor: "#ff3333",
        textColor: "#ffffff"
    };

    refreshDrivetrain(car);

    return car;
},

	getHannaCivilian() {

    return {
        name: "Hanna Civilian",
        bodyId: "hannaCivilian",

        paintColor: "#ffffff",
        rimStyle: "hyper5",

        engineLevel: 0,
        tireLevel: 0,
        transmissionLevel: 0,
        exhaustLevel: 0,
        ecuLevel: 0,
        weightReductionLevel: 0,
        suspensionLevel: 0,
        flywheelLevel: 0,

        pistonLevel: 0,
        crankLevel: 0,
        intakeLevel: 0,
        topEndLevel: 0,
        bottomEndLevel: 0,

        enginePrice: 1400,
        tirePrice: 250,
        transmissionPrice: 500,
        exhaustPrice: 160,
        ecuPrice: 310,
        weightReductionPrice: 280,
        suspensionPrice: 180,
        flywheelPrice: 360,

        pistonPrice: 450,
        crankPrice: 500,
        intakePrice: 300,
        topEndPrice: 650,
        bottomEndPrice: 750,

        hp: 168,
        torque: 128,
        weight: 2480,
        baseWeight: 2480,

        grip: 0.95,
        launchGrip: 4.4,

        spd: 0,
        pos: 0,
        rpm: 1000,
        gear: 1,

        maxRPM: 7600,
        powerbandMin: 4800,
        powerbandMax: 7200,

        gears: 6,

        topSpeed: calculateTopSpeed(
            7600,
            0.74,
            4.10
        ),

        gearRatios: [
            3.20,
            2.05,
            1.52,
            1.18,
            0.92,
            0.74
        ],

        gearMaxSpeeds: calculateGearMaxSpeeds(
            7600,
            [
                3.20,
                2.05,
                1.52,
                1.18,
                0.92,
                0.74
            ],
            4.10
        ),

        finalDrive: 4.10,
        shiftSpeed: 0.24,
        shiftTimer: 0,
        shiftRPMDrop: false,

        needleColor: "#ff3333",
        hubColor: "#ff3333",
        tachTextColor: "#ffffff",

        wheelspin: false
    };
},

};