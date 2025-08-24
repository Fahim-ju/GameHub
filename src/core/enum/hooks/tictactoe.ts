import { useState, useEffect } from "react";
import { checkEndTheGame, checkWinner } from "../../../utils/tictactoe/GameLogic";
import { findBestMove } from "../../../utils/tictactoe/AiLogic";

type Player = "x" | "o";
type Square = Player | "";
type Winner = Player | "x | o" | null;
type Difficulty = "easy" | "medium" | "hard";

interface UseTicTacToeReturn {
  squares: Square[];
  turn: Player;
  winner: Winner;
  isAiMode: boolean;
  difficulty: Difficulty;
  updateSquares: (ind: number) => void;
  resetGame: () => void;
  toggleAiMode: () => void;
  changeDifficulty: () => void;
}

export const useTicTacToe = (): UseTicTacToeReturn => {
  const [squares, setSquares] = useState<Square[]>(Array(9).fill(""));
  const [turn, setTurn] = useState<Player>("x");
  const [winner, setWinner] = useState<Winner>(null);
  const [isAiMode, setIsAiMode] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const updateSquares = (ind: number): void => {
    if (squares[ind] || winner || (isAiMode && turn === "o")) {
      return;
    }
    const s = [...squares];
    s[ind] = turn;
    setSquares(s);
    setTurn(turn === "x" ? "o" : "x");
    const W = checkWinner(s);
    if (W && (W === "x" || W === "o")) {
      setWinner(W);
    } else if (checkEndTheGame(s)) {
      setWinner("x | o");
    }
  };

  useEffect(() => {
    if (isAiMode && turn === "o" && !winner) {
      const bestMove = findBestMove([...squares], difficulty);
      if (bestMove !== -1) {
        const s = [...squares];
        s[bestMove] = "o";
        setSquares(s);
        setTurn("x");
        const W = checkWinner(s);
        if (W && (W === "x" || W === "o")) {
          setWinner(W);
        } else if (checkEndTheGame(s)) {
          setWinner("x | o");
        }
      }
    }
  }, [turn, isAiMode, winner, difficulty, squares, difficulty]);

  const resetGame = (): void => {
    setSquares(Array(9).fill(""));
    setTurn("x");
    setWinner(null);
  };

  const toggleAiMode = (): void => {
    setIsAiMode((prev) => !prev);
    resetGame();
  };

  const changeDifficulty = (): void => {
    const difficulties: Difficulty[] = ["easy", "medium", "hard"];
    const currentIndex = difficulties.indexOf(difficulty);
    const nextDifficulty = difficulties[(currentIndex + 1) % difficulties.length];
    setDifficulty(nextDifficulty);
    resetGame();
  };

  return {
    squares,
    turn,
    winner,
    isAiMode,
    difficulty,
    updateSquares,
    resetGame,
    toggleAiMode,
    changeDifficulty,
  };
};
