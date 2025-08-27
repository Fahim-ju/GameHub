import type { DifficultyType, GameModeType, VehicleTypeType } from "../enum/CarRacingEnums";

export interface CarRacingSettings {
  gameMode: GameModeType;
  player1Name: string;
  player2Name: string;
  difficulty: DifficultyType;
  vehicleType: VehicleTypeType;
}

export interface CarRacingGameState {
  settings: CarRacingSettings;
  gameStarted: boolean;
  redirectToGame: boolean;
}
