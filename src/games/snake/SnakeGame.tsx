import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SnakeGameSettings } from "../../core/models/SnakeGameModels";
import { SnakeGameMode, SnakeSpeed } from "../../core/enum/SnakeGameEnums";
import "./styles/snake.css";

interface SnakeGameProps extends SnakeGameSettings {
  backToSettings: () => void;
}

type Coord = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const BOARD_COLS = 20;
const BOARD_ROWS = 20;

// Reward (bonus) food configuration
const REWARD_FREQUENCY = 5; // spawn after every 5 normal foods eaten
const REWARD_LIFESPAN_MS = 8000; // reward stays this long
const REWARD_POINTS = 50; // bonus points

const speedMap: Record<string, number> = {
  [SnakeSpeed.SLOW]: 220,
  [SnakeSpeed.NORMAL]: 140,
  [SnakeSpeed.FAST]: 90,
};

function randomFood(exclude: Set<string>): Coord {
  while (true) {
    const x = Math.floor(Math.random() * BOARD_COLS);
    const y = Math.floor(Math.random() * BOARD_ROWS);
    const key = `${x},${y}`;
    if (!exclude.has(key)) return { x, y };
  }
}

const SnakeGame = (props: SnakeGameProps) => {
  const { playerName, gameMode, speed, backToSettings } = props;

  // Start snake with length 3 for a more realistic beginning
  const [snake, setSnake] = useState<Coord[]>(() => {
    const cx = Math.floor(BOARD_COLS / 2);
    const cy = Math.floor(BOARD_ROWS / 2);
    return [
      { x: cx, y: cy }, // head
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
  });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const nextDirectionRef = useRef(direction);
  const [food, setFood] = useState<Coord>(() => {
    const cx = Math.floor(BOARD_COLS / 2);
    const cy = Math.floor(BOARD_ROWS / 2);
    const exclude = new Set([`${cx},${cy}`, `${cx - 1},${cy}`, `${cx - 2},${cy}`]);
    return randomFood(exclude);
  });
  const foodRef = useRef(food);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [tick, setTick] = useState(0); // force rerun interval when speed changes
  const [scoreFlash, setScoreFlash] = useState(false);
  // Track how many normal foods eaten to decide when to spawn reward
  const foodsEatenRef = useRef(0);
  const [rewardFood, setRewardFood] = useState<Coord | null>(null);
  const rewardFoodRef = useRef<Coord | null>(rewardFood);
  const rewardExpireAtRef = useRef<number | null>(null);
  const [rewardRemaining, setRewardRemaining] = useState(0); // ms remaining

  // trigger a brief flash animation when score changes
  const prevScoreRef = useRef(score);
  useEffect(() => {
    if (score !== prevScoreRef.current) {
      setScoreFlash(true);
      const t = setTimeout(() => setScoreFlash(false), 350);
      prevScoreRef.current = score;
      return () => clearTimeout(t);
    }
  }, [score]);

  // Reward countdown updater
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused || isGameOver) return;
      const exp = rewardExpireAtRef.current;
      if (exp) {
        const remaining = exp - Date.now();
        if (remaining <= 0) {
          rewardExpireAtRef.current = null;
            rewardFoodRef.current = null;
            setRewardFood(null);
            setRewardRemaining(0);
        } else {
          setRewardRemaining(remaining);
        }
      }
    }, 150);
    return () => clearInterval(interval);
  }, [isPaused, isGameOver]);

  const spawnReward = useCallback((exclude: Set<string>) => {
    // don't overwrite existing reward
    if (rewardFoodRef.current) return;
    const reward = randomFood(exclude);
    rewardFoodRef.current = reward;
    setRewardFood(reward);
    rewardExpireAtRef.current = Date.now() + REWARD_LIFESPAN_MS;
    setRewardRemaining(REWARD_LIFESPAN_MS);
  }, []);

  const intervalRef = useRef<number | null>(null);

  // Adjust dynamic speed (modern mode speeds up gradually)
  const effectiveSpeed = useMemo(() => {
    const base = speedMap[speed] ?? 140;
    if (gameMode === SnakeGameMode.MODERN) {
      // speed up every 5 foods eaten (score 50) by 5ms down to a floor
      const level = Math.floor(score / 50);
      return Math.max(60, base - level * 5);
    }
    return base;
  }, [speed, gameMode, score]);

  const directionFromKey = useCallback((key: string): Direction | null => {
    switch (key) {
      case "ArrowUp":
      case "w":
      case "W":
        return "UP";
      case "ArrowDown":
      case "s":
      case "S":
        return "DOWN";
      case "ArrowLeft":
      case "a":
      case "A":
        return "LEFT";
      case "ArrowRight":
      case "d":
      case "D":
        return "RIGHT";
      default:
        return null;
    }
  }, []);

  const isOpposite = (current: Direction, next: Direction) => {
    return (
      (current === "UP" && next === "DOWN") ||
      (current === "DOWN" && next === "UP") ||
      (current === "LEFT" && next === "RIGHT") ||
      (current === "RIGHT" && next === "LEFT")
    );
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setIsPaused((p) => !p);
        return;
      }
      const next = directionFromKey(e.key);
      if (next) {
        nextDirectionRef.current = next; // store for next tick
      }
    },
    [directionFromKey]
  );

  // Setup keyboard listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Main game loop
  useEffect(() => {
    if (isPaused || isGameOver) return;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setSnake((prev) => {
        if (prev.length === 0) return prev;
        let dir = nextDirectionRef.current;
        // Prevent reversing directly
        if (isOpposite(direction, dir)) dir = direction;
        setDirection(dir);
        const head = prev[0];
        const newHead: Coord = { x: head.x, y: head.y };
        if (dir === "UP") newHead.y -= 1;
        if (dir === "DOWN") newHead.y += 1;
        if (dir === "LEFT") newHead.x -= 1;
        if (dir === "RIGHT") newHead.x += 1;

        if (gameMode === SnakeGameMode.MODERN) {
          // wrap around
          if (newHead.x < 0) newHead.x = BOARD_COLS - 1;
          if (newHead.x >= BOARD_COLS) newHead.x = 0;
          if (newHead.y < 0) newHead.y = BOARD_ROWS - 1;
          if (newHead.y >= BOARD_ROWS) newHead.y = 0;
        }

        // Wall collision (classic)
        if (gameMode === SnakeGameMode.CLASSIC) {
          if (newHead.x < 0 || newHead.x >= BOARD_COLS || newHead.y < 0 || newHead.y >= BOARD_ROWS) {
            setIsGameOver(true);
            return prev;
          }
        }

        // Self collision
        const bodySet = new Set(prev.map((c) => `${c.x},${c.y}`));
        if (bodySet.has(`${newHead.x},${newHead.y}`)) {
          setIsGameOver(true);
          return prev;
        }

        const currentFood = foodRef.current;
        const reward = rewardFoodRef.current;
        const ateRegular = currentFood && newHead.x === currentFood.x && newHead.y === currentFood.y;
        const ateReward = reward && newHead.x === reward.x && newHead.y === reward.y;

        if (ateRegular || ateReward) {
          const newSnake = [newHead, ...prev]; // grow
          if (ateRegular) {
            setScore((s) => s + 10);
            foodsEatenRef.current += 1;
            // respawn regular food
            const exclude = new Set(newSnake.map((c) => `${c.x},${c.y}`));
            if (reward) exclude.add(`${reward.x},${reward.y}`);
            const nf = randomFood(exclude);
            foodRef.current = nf;
            setFood(nf);
            // spawn reward if frequency met
            if (foodsEatenRef.current % REWARD_FREQUENCY === 0 && !rewardFoodRef.current) {
              const ex2 = new Set(newSnake.map((c) => `${c.x},${c.y}`));
              ex2.add(`${nf.x},${nf.y}`);
              spawnReward(ex2);
            }
          }
          if (ateReward) {
            setScore((s) => s + REWARD_POINTS);
            rewardFoodRef.current = null;
            setRewardFood(null);
            rewardExpireAtRef.current = null;
            setRewardRemaining(0);
          }
          setSnake(newSnake);
          return newSnake;
        }
        // Normal movement: add head, remove tail
        return [newHead, ...prev.slice(0, prev.length - 1)];
      });
    }, effectiveSpeed);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [effectiveSpeed, isPaused, isGameOver, direction, gameMode, spawnReward]);

  // Restart resets state
  const restart = () => {
    const cx = Math.floor(BOARD_COLS / 2);
    const cy = Math.floor(BOARD_ROWS / 2);
    const newSnake: Coord[] = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    setSnake(newSnake);
    setDirection("RIGHT");
    nextDirectionRef.current = "RIGHT";
    const exclude = new Set(newSnake.map((c) => `${c.x},${c.y}`));
    const nf = randomFood(exclude);
    foodRef.current = nf;
    setFood(nf);
    setScore(0);
  foodsEatenRef.current = 0;
  rewardFoodRef.current = null;
  setRewardFood(null);
  rewardExpireAtRef.current = null;
  setRewardRemaining(0);
    setIsPaused(false);
    setIsGameOver(false);
    setTick((t) => t + 1);
  };

  const gridCells = useMemo(() => {
    // Create a map that tracks which positions have snake segments and their index
    const snakeSet = new Map<string, number>();
    snake.forEach((c, idx) => snakeSet.set(`${c.x},${c.y}`, idx));
    const foodKey = `${food.x},${food.y}`;
    const rewardKey = rewardFood ? `${rewardFood.x},${rewardFood.y}` : null;
    const cells: React.ReactElement[] = [];
    for (let y = 0; y < BOARD_ROWS; y++) {
      for (let x = 0; x < BOARD_COLS; x++) {
        const key = `${x},${y}`;
        const idx = snakeSet.get(key);
        const isHead = idx === 0;
        const isBody = idx !== undefined && idx > 0;
        const isFood = key === foodKey;
        const isReward = rewardKey !== null && key === rewardKey;
        cells.push(
          <div key={key + tick} className={"cell" + (isHead ? " head" : "") + (isBody ? " body" : "") + (isFood ? " food" : "") + (isReward ? " reward-food" : "")}></div>
        );
      }
    }
    return cells;
  }, [snake, food, rewardFood, tick]);

  return (
    <div className="snake-game-wrapper">
      <div className="snake-game-top-bar">
  <motion.div className="score-panel" layout>
          <div className="player-block">
            <span className="label">Player</span>
            <span className="player-name" title={playerName}>{playerName || "Player"}</span>
          </div>
          <div className="divider" aria-hidden="true"></div>
          <div className="score-block">
            <span className="label">Score</span>
            <span className={"score-value" + (scoreFlash ? " flash" : "")}>{score}</span>
          </div>
  </motion.div>
        <div className="controls-inline">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsPaused((p) => !p)}>
            {isPaused ? "Resume" : "Pause"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={restart}>
            Restart
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={backToSettings}>
            Quit
          </motion.button>
        </div>
      </div>

      <div className={"board " + (gameMode === SnakeGameMode.CLASSIC ? "classic-mode" : "modern-mode")} style={{ 
        gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${BOARD_ROWS}, 1fr)`
      }}>
        {gridCells}
        {rewardFood && (
          <div className="reward-timer-wrapper">
            <div className="reward-timer" title="Bonus food timer">
              <span className="rt-label">Bonus</span>
              <div className="rt-bar">
                <div className="rt-fill" style={{ width: `${(rewardRemaining / REWARD_LIFESPAN_MS) * 100}%` }} />
              </div>
              <span className="rt-time">{Math.max(0, Math.ceil(rewardRemaining / 1000))}s</span>
            </div>
          </div>
        )}
        <AnimatePresence>
          {isPaused && !isGameOver && (
            <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2>Paused</h2>
              <p>Press Space or Resume to continue</p>
            </motion.div>
          )}
          {isGameOver && (
            <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2>Game Over</h2>
              <p>Final Score: {score}</p>
              <div className="overlay-actions">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={restart}>
                  Play Again
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={backToSettings}>
                  Back
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hint-text">
        <p>
          Use Arrow Keys / WASD to move. {gameMode === SnakeGameMode.MODERN ? "Wrap-around enabled." : "Don't hit the walls."} Space to
          pause.
        </p>
      </div>
    </div>
  );
};

export default SnakeGame;
