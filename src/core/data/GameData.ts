import { EnumGameId } from "../enum/EnumGameId";
import { GameCategory, type Game } from "../models/GameModels";

const ticTacToeGameData: Game = {
  gameId: EnumGameId.TicTacToe,
  name: "Tic Tac Toe",
  description: "A classic 3x3 grid game.",
  categories: [GameCategory.Board, GameCategory.SinglePlayer, GameCategory.Multiplayer, GameCategory.Strategy],
  thumbnailImage: "/images/games/tic-tac-toe/thumbnail.jpg",
  hoverImage: "/images/games/tic-tac-toe/hover.jpg",
  difficulty: 2,
  featured: true,
  enabled: true,
  route: "/games/tic-tac-toe",
};