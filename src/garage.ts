export const Garage = {

  getStarter() {
    return {
      name: "Maru MK-5",
      hp: 120,
      weight: 2400,

      spd: 0,
      pos: 0,
      rpm: 1000,

      gear: 1,
      gearRatios: [3.0, 2.0, 1.5, 1.2, 1.0],

      topSpeed: 120,
      maxRPM: 7000,

      shiftTime: 0.3,
      shiftTimer: 0
    };
  }

};