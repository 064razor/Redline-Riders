export const MPH_PER_SPEED_UNIT = 5;
export const SPEED_FEEL_SCALE = 20 / MPH_PER_SPEED_UNIT;

export function mphToSpeed(mph: number) {
    return mph / MPH_PER_SPEED_UNIT;
}

export function speedToMph(speed: number) {
    return speed * MPH_PER_SPEED_UNIT;
}
