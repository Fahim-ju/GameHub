import { motion } from "framer-motion";
import "../styles/tictactoe.css";
import { GameMode, Difficulty } from "../core/enum/TicTacToeEnums";
import type { GameModeType, DifficultyType } from "../core/enum/TicTacToeEnums";
import TicTacToe from "./TicTacToe";
import Loading from "../component/common/Loading";
import { useTicTacToe } from "../core/enum/hooks/tictactoe";

const TicTacToeInitialPage = () => {
  const {
    settings,
    gameStarted,
    redirectToGame,
    updateSettings,
    startGame,
    setRedirectToGame
  } = useTicTacToe();

  if (gameStarted) {
    return <Loading />;
  }

  if (redirectToGame) {
    return <TicTacToe {...settings} backToSettings={() => setRedirectToGame(false)} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startGame();
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
                  updateSettings({
                    gameMode: e.target.value as GameModeType,
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
                  updateSettings({
                    gameMode: e.target.value as GameModeType,
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
            onChange={(e) => updateSettings({ player1Name: e.target.value })}
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
              onChange={(e) => updateSettings({ player2Name: e.target.value })}
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
                updateSettings({
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
