export const EnumGameId = {
    TicTacToe: "tic_tac_toe",
    ConnectFour: "connect_four",
    Snake: "snake",
    Minesweeper: "minesweeper",
    Sudoku: "sudoku",
    CarRacing: "carracing",
} as const;

export type GameId = typeof EnumGameId[keyof typeof EnumGameId];
