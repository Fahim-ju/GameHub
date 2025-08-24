import type { DifficultyType, GameModeType } from "../enum/TicTacToeEnums";

export interface GameSettings {
    gameMode: GameModeType;
    player1Name: string;
    player2Name: string;
    difficulty: DifficultyType;
}