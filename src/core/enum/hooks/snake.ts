import { useState, useEffect } from 'react';
import { SnakeGameMode, type SnakeGameModeType, SnakeSpeed, type SnakeSpeedType } from '../SnakeGameEnums';
import type { SnakeGameSettings } from '../../models/SnakeGameModels';

interface UseSnakeReturn {
  settings: SnakeGameSettings;
  gameStarted: boolean;
  redirectToGame: boolean;
  updateSettings: (settings: Partial<SnakeGameSettings>) => void;
  startGame: () => void;
  setRedirectToGame: (redirect: boolean) => void;
}

export const useSnake = (initialSettings?: SnakeGameSettings): UseSnakeReturn => {
  const [settings, setSettings] = useState<SnakeGameSettings>(
    initialSettings || {
      playerName: '',
      gameMode: SnakeGameMode.CLASSIC as SnakeGameModeType,
      speed: SnakeSpeed.NORMAL as SnakeSpeedType,
    }
  );

  const [gameStarted, setGameStarted] = useState(false);
  const [redirectToGame, setRedirectToGame] = useState(false);

  const updateSettings = (newSettings: Partial<SnakeGameSettings>): void => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const startGame = (): void => {
    setGameStarted(true);
  };

  useEffect(() => {
    if (gameStarted) {
      const timer = setTimeout(() => {
        setGameStarted(false);
        setRedirectToGame(true);
      }, 3000); // mimic loading screen delay similar to TicTacToe
      return () => clearTimeout(timer);
    }
  }, [gameStarted]);

  return {
    settings,
    gameStarted,
    redirectToGame,
    updateSettings,
    startGame,
    setRedirectToGame,
  };
};
