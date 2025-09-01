export const SnakeGameMode = {
  CLASSIC: 'classic',
  MODERN: 'modern'
} as const;

export type SnakeGameModeType = typeof SnakeGameMode[keyof typeof SnakeGameMode];

export const SnakeSpeed = {
  SLOW: 'slow',
  NORMAL: 'normal',
  FAST: 'fast'
} as const;

export type SnakeSpeedType = typeof SnakeSpeed[keyof typeof SnakeSpeed];
