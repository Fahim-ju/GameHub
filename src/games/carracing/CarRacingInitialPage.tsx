import { motion } from "framer-motion";
import "./styles/carracing.css";
import { GameMode, Difficulty, VehicleType } from "../../core/enum/CarRacingEnums";
import type { GameModeType, DifficultyType } from "../../core/enum/CarRacingEnums";
import CarRacing from "./CarRacing";
import Loading from "../../component/common/Loading";
import { useCarRacing } from "../../core/enum/hooks/carracing";

const CarRacingInitialPage = () => {
  const { settings, gameStarted, redirectToGame, updateSettings, startGame, setRedirectToGame } = useCarRacing();

  if (gameStarted) {
    return <Loading />;
  }

  if (redirectToGame) {
    return <CarRacing {...settings} backToSettings={() => setRedirectToGame(false)} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startGame();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="carracing-initial-container">
      <h2>Car Racing Settings</h2>
      <form onSubmit={handleSubmit} className="carracing-settings-form">
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

        {/* Two-player removed: always single player */}

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

        <div className="form-group">
          <label>Vehicle Type:</label>
          <div className="vehicle-options">
            <motion.div
              className={`vehicle-option ${settings.vehicleType === VehicleType.SPORT ? "selected" : ""}`}
              onClick={() => updateSettings({ vehicleType: VehicleType.SPORT })}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="vehicle-icon">🏎️</div>
              <p>Sport Car</p>
              <small>Fast & Agile</small>
            </motion.div>
            <motion.div
              className={`vehicle-option ${settings.vehicleType === VehicleType.SUV ? "selected" : ""}`}
              onClick={() => updateSettings({ vehicleType: VehicleType.SUV })}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="vehicle-icon">🚙</div>
              <p>SUV</p>
              <small>Balanced Performance</small>
            </motion.div>
            <motion.div
              className={`vehicle-option ${settings.vehicleType === VehicleType.TRUCK ? "selected" : ""}`}
              onClick={() => updateSettings({ vehicleType: VehicleType.TRUCK })}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="vehicle-icon">🚚</div>
              <p>Truck</p>
              <small>Powerful & Sturdy</small>
            </motion.div>
          </div>
        </div>

        <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="start-game-btn">
          Start Game
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CarRacingInitialPage;
