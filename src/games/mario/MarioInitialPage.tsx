import { motion } from 'framer-motion';
import Loading from '../../component/common/Loading';
import { useMario } from '../../core/enum/hooks/mario';
import MarioGame from './MarioGame';
import '../tictactoe/styles/tictactoe.css';

const MarioInitialPage = () => {
  const { settings, gameStarted, redirectToGame, updateSettings, startGame, setRedirectToGame } = useMario();

  if (gameStarted) {
    return <Loading />;
  }

  if (redirectToGame) {
    return <MarioGame {...settings} backToSettings={() => setRedirectToGame(false)} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startGame();
  };

  type DifficultyType = 'easy' | 'normal' | 'hard';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="tictactoe-initial-container">
      <h2>Mario Game Settings</h2>
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
          <label>Difficulty:</label>
          <select value={settings.difficulty} onChange={(e) => updateSettings({ difficulty: e.target.value as DifficultyType })}>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="start-game-btn">
          Start Game
        </motion.button>
      </form>
    </motion.div>
  );
};

export default MarioInitialPage;
