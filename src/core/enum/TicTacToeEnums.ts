export const GameMode = {
    SINGLE: 'single',
    DOUBLE: 'double'
} as const;

export type GameModeType = typeof GameMode[keyof typeof GameMode];

export const Difficulty = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
} as const;

export type DifficultyType = typeof Difficulty[keyof typeof Difficulty];
