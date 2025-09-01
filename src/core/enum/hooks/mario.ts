import { useState, useEffect } from 'react';
import type { MarioGameSettings } from '../../models/MarioGameModels';

interface UseMarioReturn {
  settings: MarioGameSettings;
  gameStarted: boolean;
  redirectToGame: boolean;
  updateSettings: (settings: Partial<MarioGameSettings>) => void;
  startGame: () => void;
  setRedirectToGame: (redirect: boolean) => void;
}

export const useMario = (initialSettings?: MarioGameSettings): UseMarioReturn => {
  const [settings, setSettings] = useState<MarioGameSettings>(
    initialSettings || {
      playerName: '',
      difficulty: 'normal',
    }
  );

  const [gameStarted, setGameStarted] = useState(false);
  const [redirectToGame, setRedirectToGame] = useState(false);

  const updateSettings = (newSettings: Partial<MarioGameSettings>): void => {
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
      }, 2000);
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
