export const GameMode = {
  SINGLE: "single",
  DOUBLE: "double"
} as const;

export const Difficulty = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard"
} as const;

export const VehicleType = {
  SPORT: "sport",
  SUV: "suv",
  TRUCK: "truck"
} as const;

export type GameModeType = typeof GameMode[keyof typeof GameMode];
export type DifficultyType = typeof Difficulty[keyof typeof Difficulty];
export type VehicleTypeType = typeof VehicleType[keyof typeof VehicleType];
