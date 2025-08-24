import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/tictactoe.css";
import { GameMode, Difficulty } from "../core/enum/TicTacToeEnums";
import type { GameModeType, DifficultyType } from "../core/enum/TicTacToeEnums";
import type { TicTacToeGameSettings } from "../core/models/TicTacToeModels";
import TicTacToe from "./TicTacToe";
import Loading from "../component/common/Loading";

const TicTacToeInitialPage = () => {
  const [settings, setSettings] = useState<TicTacToeGameSettings>({
    gameMode: GameMode.SINGLE,
    player1Name: "",
    player2Name: "Computer",
    difficulty: Difficulty.MEDIUM,
  });

  const [redirectToGame, setRedirectToGame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      const timer = setTimeout(() => {
        setGameStarted(false);
        setRedirectToGame(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted]);

  if (gameStarted) {
    return <Loading />;
  }

  if (redirectToGame) {
    return <TicTacToe {...settings} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGameStarted(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="tictactoe-initial-container">
      <h2>Tic Tac Toe Settings</h2>
      <form onSubmit={handleSubmit} className="tictactoe-settings-form">
        <div className="form-group">
          <label>Game Mode:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value={GameMode.SINGLE}
                checked={settings.gameMode === GameMode.SINGLE}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    gameMode: e.target.value as GameModeType,
                    player2Name: e.target.value === GameMode.SINGLE ? "Computer" : "",
                  })
                }
              />
              Single Player
            </label>
            <label>
              <input
                type="radio"
                value={GameMode.DOUBLE}
                checked={settings.gameMode === GameMode.DOUBLE}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    gameMode: e.target.value as GameModeType,
                    player2Name: e.target.value === GameMode.SINGLE ? "Computer" : "",
                  })
                }
              />
              Two Players
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="player1">Player 1 Name:</label>
          <input
            type="text"
            id="player1"
            value={settings.player1Name}
            onChange={(e) => setSettings({ ...settings, player1Name: e.target.value })}
            required
            placeholder="Enter Player 1 name"
          />
        </div>

        {settings.gameMode === "double" && (
          <div className="form-group">
            <label htmlFor="player2">Player 2 Name:</label>
            <input
              type="text"
              id="player2"
              value={settings.player2Name}
              onChange={(e) => setSettings({ ...settings, player2Name: e.target.value })}
              required
              placeholder="Enter Player 2 name"
            />
          </div>
        )}

        {settings.gameMode === GameMode.SINGLE && (
          <div className="form-group">
            <label>Difficulty Level:</label>
            <select
              value={settings.difficulty}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  difficulty: e.target.value as DifficultyType,
                })
              }
            >
              <option value={Difficulty.EASY}>Easy</option>
              <option value={Difficulty.MEDIUM}>Medium</option>
              <option value={Difficulty.HARD}>Hard</option>
            </select>
          </div>
        )}

        <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="start-game-btn">
          Start Game
        </motion.button>
      </form>
    </motion.div>
  );
};

export default TicTacToeInitialPage;
