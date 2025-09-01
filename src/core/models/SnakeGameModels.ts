import type { SnakeGameModeType, SnakeSpeedType } from '../enum/SnakeGameEnums';

export interface SnakeGameSettings {
  playerName: string;
  gameMode: SnakeGameModeType;
  speed: SnakeSpeedType;
}
