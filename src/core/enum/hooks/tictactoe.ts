import { useState, useEffect } from "react";
import { checkEndTheGame, checkWinner } from "../../../utils/tictactoe/GameLogic";
import { findBestMove, type Difficulty } from "../../../utils/tictactoe/AiLogic";
import { GameMode, type DifficultyType } from "../TicTacToeEnums";
import type { TicTacToeGameSettings } from "../../models/TicTacToeModels";

type Player = "x" | "o";
type Square = Player | "";
type Winner = Player | "x | o" | null;

interface UseTicTacToeReturn {
  squares: Square[];
  turn: Player;
  winner: Winner;
  isAiMode: boolean;
  difficulty: Difficulty;
  settings: TicTacToeGameSettings;
  gameStarted: boolean;
  redirectToGame: boolean;
  updateSquares: (ind: number) => void;
  resetGame: () => void;
  toggleAiMode: () => void;
  changeDifficulty: () => void;
  updateSettings: (settings: Partial<TicTacToeGameSettings>) => void;
  startGame: () => void;
  setRedirectToGame: (redirect: boolean) => void;
}

export const useTicTacToe = (initialSettings?: TicTacToeGameSettings): UseTicTacToeReturn => {
  // Settings state
  const [settings, setSettings] = useState<TicTacToeGameSettings>(
    initialSettings || {
      gameMode: GameMode.SINGLE,
      player1Name: "",
      player2Name: "",
      difficulty: "medium" as Difficulty,
    }
  );

  // Game state
  const [squares, setSquares] = useState<Square[]>(Array(9).fill(""));
  const [turn, setTurn] = useState<Player>("x");
  const [winner, setWinner] = useState<Winner>(null);
  const [isAiMode, setIsAiMode] = useState<boolean>(settings.gameMode === GameMode.SINGLE);
  const [difficulty, setDifficulty] = useState<DifficultyType>(settings.difficulty as Difficulty);
  
  // Navigation state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [redirectToGame, setRedirectToGame] = useState<boolean>(false);

  // Update settings function
  const updateSettings = (newSettings: Partial<TicTacToeGameSettings>): void => {
    setSettings(prev => {
      // Handle special case for game mode changes
      if (newSettings.gameMode) {
        return {
          ...prev,
          ...newSettings,
          // When switching to single player mode, set player2Name to "Computer"
        };
      }
      return { ...prev, ...newSettings };
    });
  };

  // Start game function
  const startGame = (): void => {
    setGameStarted(true);
  };

  // Game logic functions
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

  // AI move effect
  useEffect(() => {
    if (isAiMode && turn === "o" && !winner) {
      // Add delay for a more natural feel to the computer's move
      const timeoutId = setTimeout(() => {
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
      }, 2200); // 2200ms delay for a natural thinking time

      // Clean up the timeout when component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [turn, isAiMode, winner, difficulty, squares]);

  // Game started effect
  useEffect(() => {
    if (gameStarted) {
      const timer = setTimeout(() => {
        setGameStarted(false);
        setRedirectToGame(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted]);

  // Game control functions
  const resetGame = (): void => {
    setSquares(Array(9).fill(""));
    setTurn("x");
    setWinner(null);
  };

  const toggleAiMode = (): void => {
    setIsAiMode((prev) => !prev);
    updateSettings({ gameMode: isAiMode ? GameMode.DOUBLE : GameMode.SINGLE });
    resetGame();
  };

  const changeDifficulty = (): void => {
    const difficulties: Difficulty[] = ["easy", "medium", "hard"];
    const currentIndex = difficulties.indexOf(difficulty);
    const nextDifficulty = difficulties[(currentIndex + 1) % difficulties.length];
    setDifficulty(nextDifficulty);
    updateSettings({ difficulty: nextDifficulty });
    resetGame();
  };

  return {
    squares,
    turn,
    winner,
    isAiMode,
    difficulty,
    settings,
    gameStarted,
    redirectToGame,
    updateSquares,
    resetGame,
    toggleAiMode,
    changeDifficulty,
    updateSettings,
    startGame,
    setRedirectToGame
  };
};
