import { useState } from "react";
import { Difficulty, GameMode, VehicleType } from "../CarRacingEnums";
import type { CarRacingSettings } from "../../models/CarRacingModels";

export const useCarRacing = () => {
  const [settings, setSettings] = useState<CarRacingSettings>({
    gameMode: GameMode.SINGLE,
    player1Name: "",
    player2Name: "Player 2",
    difficulty: Difficulty.MEDIUM,
    vehicleType: VehicleType.SPORT,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [redirectToGame, setRedirectToGame] = useState(false);

  const updateSettings = (newSettings: Partial<CarRacingSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeout(() => {
      setGameStarted(false);
      setRedirectToGame(true);
    }, 1500);
  };

  return {
    settings,
    gameStarted,
    redirectToGame,
    updateSettings,
    startGame,
    setRedirectToGame,
  };
};
