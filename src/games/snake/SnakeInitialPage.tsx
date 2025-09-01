import { motion } from "framer-motion";
import { SnakeGameMode, type SnakeGameModeType, SnakeSpeed, type SnakeSpeedType } from "../../core/enum/SnakeGameEnums";
import Loading from "../../component/common/Loading";
import { useSnake } from "../../core/enum/hooks/snake";
import "../tictactoe/styles/tictactoe.css";
import SnakeGame from "./SnakeGame";

const SnakeInitialPage = () => {
  const { settings, gameStarted, redirectToGame, updateSettings, startGame, setRedirectToGame } = useSnake();

  if (gameStarted) {
    return <Loading />;
  }

  if (redirectToGame) {
    return <SnakeGame {...settings} backToSettings={() => setRedirectToGame(false)} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startGame();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="tictactoe-initial-container">
      <h2>Snake Game Settings</h2>
      <form onSubmit={handleSubmit} className="tictactoe-settings-form">
        <div className="form-group">
          <label htmlFor="playerName">Player Name:</label>
          <input
            type="text"
            id="playerName"
            value={settings.playerName}
            onChange={(e) => updateSettings({ playerName: e.target.value })}
            required
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label>Game Mode:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value={SnakeGameMode.CLASSIC}
                checked={settings.gameMode === SnakeGameMode.CLASSIC}
                onChange={(e) => updateSettings({ gameMode: e.target.value as SnakeGameModeType })}
              />
              Classic
            </label>
            <label>
              <input
                type="radio"
                value={SnakeGameMode.MODERN}
                checked={settings.gameMode === SnakeGameMode.MODERN}
                onChange={(e) => updateSettings({ gameMode: e.target.value as SnakeGameModeType })}
              />
              Modern
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Speed:</label>
          <select value={settings.speed} onChange={(e) => updateSettings({ speed: e.target.value as SnakeSpeedType })}>
            <option value={SnakeSpeed.SLOW}>Slow</option>
            <option value={SnakeSpeed.NORMAL}>Normal</option>
            <option value={SnakeSpeed.FAST}>Fast</option>
          </select>
        </div>

        <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="start-game-btn">
          Start Game
        </motion.button>
      </form>
    </motion.div>
  );
};

export default SnakeInitialPage;
