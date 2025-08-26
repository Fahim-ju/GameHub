import React from 'react';
import type { FC } from 'react';
import type { CarRacingSettings } from '../../core/models/CarRacingModels';

interface CarRacingProps extends CarRacingSettings {
  backToSettings: () => void;
}

const CarRacing: FC<CarRacingProps> = ({
  gameMode,
  player1Name,
  player2Name,
  difficulty,
  vehicleType,
  backToSettings
}) => {
  return (
    <div className="carracing-game-container">
      <h1>Car Racing Game</h1>
      <div className="game-info">
        <p>Game Mode: {gameMode}</p>
        <p>Player 1: {player1Name}</p>
        {gameMode === 'double' && <p>Player 2: {player2Name}</p>}
        <p>Difficulty: {difficulty}</p>
        <p>Vehicle Type: {vehicleType}</p>
      </div>
      <div className="game-controls">
        <button onClick={backToSettings}>Back to Settings</button>
      </div>
      <div className="game-area">
        <p>Game implementation coming soon...</p>
      </div>
    </div>
  );
};

export default CarRacing;
