import React from "react";
import type { MarioGameSettings } from "../../core/models/MarioGameModels";

interface MarioGameProps extends MarioGameSettings {
  backToSettings: () => void;
}

const MarioGame: React.FC<MarioGameProps> = ({ playerName, difficulty, backToSettings }) => {
  // Responsive canvas size container uses flex; ensure aspect ratio and min height
  return <div className="mario-game-wrapper"></div>;
};

export default MarioGame;
