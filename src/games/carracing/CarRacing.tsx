import { useState, useEffect, useRef, useCallback } from "react";
import type { FC } from "react";
import type { CarRacingSettings } from "../../core/models/CarRacingModels";
import { Difficulty, VehicleType } from "../../core/enum/CarRacingEnums";
import "./styles/carracing.css";

interface CarRacingProps extends CarRacingSettings {
  backToSettings: () => void;
}

interface ObstaclePosition {
  x: number;
  y: number;
  lane: number;
  width: number;
  height: number;
  imageIndex: number;
}

interface PowerUpPosition {
  x: number;
  y: number;
  type: "speed" | "shield";
  active: boolean;
}

const CAR_WIDTH = 40;
const CAR_HEIGHT = 60;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 40;
const ROAD_PADDING = 30;
const POWER_UP_SIZE = 30;

const CarRacing: FC<CarRacingProps> = ({ gameMode, player1Name, difficulty, vehicleType, backToSettings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carImageRef = useRef<HTMLImageElement | null>(null);
  const obstacleImageRef = useRef<HTMLImageElement[] | null>(null);
  const shieldImageRef = useRef<HTMLImageElement | null>(null);
  const speedImageRef = useRef<HTMLImageElement | null>(null);
  // Load car image asset from public folder once
  useEffect(() => {
    const img = new Image();
    if(vehicleType === VehicleType.SPORT) img.src = "/GameHub/racing-car.png";
    else if(vehicleType === VehicleType.POLICE) img.src = "/GameHub/police-car.png";
    else img.src = "/GameHub/suv-car.png";

    img.onload = () => {
      carImageRef.current = img;
    };
    img.onerror = () => {
      carImageRef.current = null;
    };

    return () => {
      carImageRef.current = null;
    };
  }, [vehicleType]);

  // Load power-up images from public folder
  useEffect(() => {
    // Load shield image
    const shieldImg = new Image();
    shieldImg.src = "/GameHub/car-shield.png";
    shieldImg.onload = () => { shieldImageRef.current = shieldImg; };
    shieldImg.onerror = () => { shieldImageRef.current = null; };

    // Load speed image
    const speedImg = new Image();
    speedImg.src = "/GameHub/speed.png";
    speedImg.onload = () => { speedImageRef.current = speedImg; };
    speedImg.onerror = () => { speedImageRef.current = null; };

    return () => {
      shieldImageRef.current = null;
      speedImageRef.current = null;
    };
  }, []);
  useEffect(() => {
    const obstacleImages = [
      "/GameHub/car2.png",
      "/GameHub/car3.png",
      "/GameHub/car4.png",
      "/GameHub/car5.png",
      "/GameHub/car6.png",
      "/GameHub/playerCar.png",
      "/GameHub/playerCar2.png",
      "/GameHub/playerCar3.png",
      "/GameHub/racing-car.png",
    ];

    const images: HTMLImageElement[] = [];
    obstacleImages.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        images[index] = img;
        if (images.filter((img) => img).length === obstacleImages.length) {
          obstacleImageRef.current = images;
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load obstacle image: ${src}`);
      };
    });

    return () => {
      obstacleImageRef.current = null;
    };
  }, []);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState({ player1: 0 });
  const [winner, setWinner] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(3);

  // Game state refs (to avoid dependency issues in animation loop)
  const gameStateRef = useRef({
    player1: { x: 0, y: 0, speed: 3, lane: 1 },
    obstacles: [] as ObstaclePosition[],
    powerUps: [] as PowerUpPosition[],
    roadSpeed: 5,
    roadY: 0,
    animationFrameId: 0,
    keysPressed: new Set<string>(),
    shield: { player1: false },
    speedBoost: { player1: 0 },
    lastObstacleTime: 0,
    lastPowerUpTime: 0,
    gameTime: 0,
    difficultySpeed: difficulty === Difficulty.EASY ? 2 : difficulty === Difficulty.MEDIUM ? 3 : 4,
    isGameOver: false,
  });

  // Initialize game
  useEffect(() => {
    const initGame = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Position players in the middle of the road
      gameStateRef.current.player1 = {
        x: canvas.width / 2 - CAR_WIDTH / 2, // Center of the canvas
        y: canvas.height - CAR_HEIGHT - 20,
        speed: 3,
        lane: 1, // Keep lane for backward compatibility, but not used for positioning
      };

      gameStateRef.current.obstacles = [];
      gameStateRef.current.powerUps = [];
      gameStateRef.current.roadY = 0;
      gameStateRef.current.difficultySpeed = difficulty === Difficulty.EASY ? 2 : difficulty === Difficulty.MEDIUM ? 3 : 4;

      setScore({ player1: 0 });
      setWinner(null);
      // start countdown for initial game
      setCountdown(3);
    };

    initGame();

    const capturedAnimationId = gameStateRef.current.animationFrameId;
    return () => {
      cancelAnimationFrame(capturedAnimationId);
    };
  }, [difficulty, gameMode]);

  // Countdown effect: use interval with functional updater so restart reliably starts ticking
  useEffect(() => {
    if (countdown === null) return;

    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(id);
          setGameStarted(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [countdown]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keysPressed.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keysPressed.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Minimal input processing (reads keys from ref)
  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const processInput = useCallback(() => {
    const keys = gameStateRef.current.keysPressed;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Player 1 controls (Arrow keys) - Allow movement to road edges only
    if (keys.has("ArrowLeft")) {
      // Allow movement to the road edge (not into grass)
      const minX = ROAD_PADDING; // Stop at road edge
      gameStateRef.current.player1.x = Math.max(minX, gameStateRef.current.player1.x - gameStateRef.current.player1.speed);
    }
    if (keys.has("ArrowRight")) {
      // Allow movement to the road edge (not into grass)
      const maxX = canvas.width - ROAD_PADDING - CAR_WIDTH; // Stop at road edge
      gameStateRef.current.player1.x = Math.min(maxX, gameStateRef.current.player1.x + gameStateRef.current.player1.speed);
    }
  }, []);

  // Helper functions
  const drawRoad = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, laneCount: number, laneWidth: number) => {
    // Draw roadside (grass) background with a more vibrant color
    ctx.fillStyle = "#32CD32"; // Lime green for more vibrant grass
    ctx.fillRect(0, 0, ROAD_PADDING, canvas.height);
    ctx.fillRect(canvas.width - ROAD_PADDING, 0, ROAD_PADDING, canvas.height);

    // Draw road background
    ctx.fillStyle = "#333";
    ctx.fillRect(ROAD_PADDING, 0, canvas.width - ROAD_PADDING * 2, canvas.height);

    // Draw lane lines
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);

    // Update road lines position for animation
    gameStateRef.current.roadY += gameStateRef.current.roadSpeed;
    if (gameStateRef.current.roadY > 40) {
      gameStateRef.current.roadY = 0;
    }

    // Draw lane dividers
    for (let i = 1; i < laneCount; i++) {
      const x = ROAD_PADDING + i * laneWidth;
      ctx.beginPath();

      // Offset by roadY to animate
      let y = -40 + gameStateRef.current.roadY;
      while (y < canvas.height) {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 20);
        y += 40;
      }

      ctx.stroke();
    }

    ctx.setLineDash([]);
  }, []);

  const drawCars = useCallback((ctx: CanvasRenderingContext2D) => {
    // Draw player 1, prefer image icon
    const img = carImageRef.current;
    if (img) {
      ctx.drawImage(img, gameStateRef.current.player1.x, gameStateRef.current.player1.y, CAR_WIDTH, CAR_HEIGHT);
    } else {
      ctx.fillStyle = "#FF5733";
      ctx.fillRect(gameStateRef.current.player1.x, gameStateRef.current.player1.y, CAR_WIDTH, CAR_HEIGHT);
    }

    // Draw shield effect if active
    if (gameStateRef.current.shield.player1) {
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(
        gameStateRef.current.player1.x + CAR_WIDTH / 2,
        gameStateRef.current.player1.y + CAR_HEIGHT / 2,
        CAR_WIDTH * 0.7,
        CAR_HEIGHT * 0.7,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // single player only
  }, []);

  const drawScore = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#FFF";
      ctx.font = "16px Arial";
      ctx.textAlign = "left";

      const s = scoreRef.current;
      // Draw player 1 score
      ctx.fillText(`${player1Name}: ${Math.floor(s.player1)}`, 20, 30);

      // single player only
    },
    [player1Name]
  );

  const createObstacle = useCallback((laneCount: number, laneWidth: number) => {
    const lane = Math.floor(Math.random() * laneCount);
    const x = ROAD_PADDING + lane * laneWidth + (laneWidth - OBSTACLE_WIDTH) / 2;
    const imageIndex = Math.floor(Math.random() * 9); // 9 different car images

    gameStateRef.current.obstacles.push({
      x,
      y: -OBSTACLE_HEIGHT,
      lane,
      width: OBSTACLE_WIDTH,
      height: OBSTACLE_HEIGHT,
      imageIndex,
    });
  }, []);

  const updateObstacles = useCallback((canvas: HTMLCanvasElement, deltaTime: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseSpeed = gameStateRef.current.difficultySpeed;
    const currentSpeed = baseSpeed + Math.min(5, gameStateRef.current.gameTime / 30);

    gameStateRef.current.obstacles = gameStateRef.current.obstacles.filter((obstacle) => {
      // Update position (scaled by deltaTime)
      obstacle.y += currentSpeed * Math.max(1, deltaTime * 60);

      // Draw obstacle
      const obstacleImages = obstacleImageRef.current;
      if (obstacleImages && obstacleImages[obstacle.imageIndex]) {
        ctx.drawImage(obstacleImages[obstacle.imageIndex], obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else {
        ctx.fillStyle = "#FFA648";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }

      // Remove if offscreen
      return obstacle.y < canvas.height;
    });
  }, []);

  const createPowerUp = useCallback((laneCount: number, laneWidth: number) => {
    const lane = Math.floor(Math.random() * laneCount);
    const x = ROAD_PADDING + lane * laneWidth + (laneWidth - POWER_UP_SIZE) / 2;
    const type = Math.random() > 0.5 ? "speed" : "shield";

    gameStateRef.current.powerUps.push({
      x,
      y: -POWER_UP_SIZE,
      type,
      active: true,
    });
  }, []);

  const updatePowerUps = useCallback((canvas: HTMLCanvasElement, deltaTime: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseSpeed = gameStateRef.current.difficultySpeed;
    const currentSpeed = baseSpeed + Math.min(5, gameStateRef.current.gameTime / 30);

    gameStateRef.current.powerUps = gameStateRef.current.powerUps.filter((powerUp) => {
      if (!powerUp.active) return false;

      // Update position (scaled by deltaTime)
      powerUp.y += currentSpeed * Math.max(1, deltaTime * 60);

      // Draw power-up
      if (powerUp.type === "speed") {
        const speedImg = speedImageRef.current;
        if (speedImg) {
          ctx.drawImage(
            speedImg,
            powerUp.x,
            powerUp.y,
            POWER_UP_SIZE,
            POWER_UP_SIZE
          );
        } else {
          ctx.fillStyle = "#FFFF00";
          ctx.beginPath();
          ctx.arc(powerUp.x + POWER_UP_SIZE / 2, powerUp.y + POWER_UP_SIZE / 2, POWER_UP_SIZE / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else { // shield
        const shieldImg = shieldImageRef.current;
        if (shieldImg) {
          ctx.drawImage(
            shieldImg,
            powerUp.x,
            powerUp.y,
            POWER_UP_SIZE,
            POWER_UP_SIZE
          );
        } else {
          ctx.fillStyle = "#00FFFF";
          ctx.beginPath();
          ctx.arc(powerUp.x + POWER_UP_SIZE / 2, powerUp.y + POWER_UP_SIZE / 2, POWER_UP_SIZE / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Remove if offscreen
      return powerUp.y < canvas.height;
    });
  }, []);
  const checkCollisions = useCallback(() => {
    // Obstacle collisions
    for (const obstacle of gameStateRef.current.obstacles) {
      // Add collision tolerance to make detection less sensitive
      const COLLISION_TOLERANCE = 8; // pixels of tolerance

      if (
        !gameStateRef.current.shield.player1 &&
        gameStateRef.current.player1.x + COLLISION_TOLERANCE < obstacle.x + obstacle.width - COLLISION_TOLERANCE &&
        gameStateRef.current.player1.x + CAR_WIDTH - COLLISION_TOLERANCE > obstacle.x + COLLISION_TOLERANCE &&
        gameStateRef.current.player1.y + COLLISION_TOLERANCE < obstacle.y + obstacle.height - COLLISION_TOLERANCE &&
        gameStateRef.current.player1.y + CAR_HEIGHT - COLLISION_TOLERANCE > obstacle.y + COLLISION_TOLERANCE
      ) {
        handleGameOver(null);
        return;
      }
    }

    // Power-up pickups
    for (const powerUp of gameStateRef.current.powerUps) {
      if (!powerUp.active) continue;
      if (
        gameStateRef.current.player1.x < powerUp.x + POWER_UP_SIZE &&
        gameStateRef.current.player1.x + CAR_WIDTH > powerUp.x &&
        gameStateRef.current.player1.y < powerUp.y + POWER_UP_SIZE &&
        gameStateRef.current.player1.y + CAR_HEIGHT > powerUp.y
      ) {
        powerUp.active = false;
        applyPowerUp(powerUp.type);
      }
    }
  }, []);

  const applyPowerUp = (type: "speed" | "shield") => {
    if (type === "speed") {
      gameStateRef.current.speedBoost.player1 = 5; // 5 seconds of speed boost
    } else {
      // shield
      gameStateRef.current.shield.player1 = true;

      // Shield lasts for 5 seconds
      setTimeout(() => {
        gameStateRef.current.shield.player1 = false;
      }, 5000);
    }
  };

  const handleGameOver = (winnerName: string | null) => {
    // Mark both React state and internal ref so the animation loop can stop immediately
    setGameOver(true);
    setWinner(winnerName);
    gameStateRef.current.isGameOver = true;
    // cancel any scheduled frame
    cancelAnimationFrame(gameStateRef.current.animationFrameId);
  };

  const restartGame = () => {
    // Reset state and internal refs so a fresh game can start
    setGameOver(false);
    setGameStarted(false);
    // trigger countdown so it ticks correctly
    setCountdown(3);
    setScore({ player1: 0 });
    gameStateRef.current.isGameOver = false;
    gameStateRef.current.obstacles = [];
    gameStateRef.current.powerUps = [];
    gameStateRef.current.lastObstacleTime = 0;
    gameStateRef.current.lastPowerUpTime = 0;
    gameStateRef.current.gameTime = 0;
    gameStateRef.current.animationFrameId = 0;
    gameStateRef.current.shield = { player1: false };
    gameStateRef.current.speedBoost = { player1: 0 };
    // ensure player's speed resets to the slower initial speed
    if (gameStateRef.current.player1) gameStateRef.current.player1.speed = 3;
  };

  // Main animation loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const laneCount = 3;
    const roadWidth = canvas.width - ROAD_PADDING * 2;
    const laneWidth = roadWidth / laneCount;

    let lastTime = performance.now();

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      gameStateRef.current.gameTime += deltaTime;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update
      drawRoad(ctx, canvas, laneCount, laneWidth);
      processInput();
      updateObstacles(canvas, deltaTime);
      updatePowerUps(canvas, deltaTime);
      drawCars(ctx);
      drawScore(ctx);
      checkCollisions();

      // If a collision triggered game over, stop further updates (prevents final score increment)
      if (gameStateRef.current.isGameOver) {
        return; // don't schedule another frame or update score
      }

      // Spawn obstacles
      if (time - gameStateRef.current.lastObstacleTime > 1500 - difficulty.length * 200) {
        createObstacle(laneCount, laneWidth);
        gameStateRef.current.lastObstacleTime = time;
      }

      // Spawn power-ups
      if (time - gameStateRef.current.lastPowerUpTime > 5000) {
        if (Math.random() > 0.7) {
          createPowerUp(laneCount, laneWidth);
          gameStateRef.current.lastPowerUpTime = time;
        }
      }

      // Update boosts
      if (gameStateRef.current.speedBoost.player1 > 0) gameStateRef.current.speedBoost.player1 -= deltaTime;

      // Score
      setScore((prev) => ({
        player1: prev.player1 + deltaTime * 10,
      }));

      const id = requestAnimationFrame(animate);
      gameStateRef.current.animationFrameId = id;
    };

    const id = requestAnimationFrame(animate);
    gameStateRef.current.animationFrameId = id;

    return () => {
      cancelAnimationFrame(id);
    };
  }, [
    gameStarted,
    gameOver,
    gameMode,
    difficulty,
    drawRoad,
    processInput,
    updateObstacles,
    updatePowerUps,
    drawCars,
    drawScore,
    checkCollisions,
    createObstacle,
    createPowerUp,
  ]);

  return (
    <div className="carracing-game-container">
      <h1>Car Racing Game</h1>

      <div className="game-controls">
        <button onClick={backToSettings} className="control-btn">
          Back to Settings
        </button>
        {gameOver && (
          <button onClick={restartGame} className="control-btn restart-btn">
            Play Again
          </button>
        )}
      </div>

      {countdown !== null && (
        <div className="countdown-overlay">
          <div className="countdown">{countdown}</div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-overlay">
          <h2>Game Over!</h2>
          {winner ? <p>{winner} wins!</p> : <p>Your score: {Math.floor(score.player1)}</p>}
          <div className="game-over-actions">
            <button onClick={restartGame} className="control-btn restart-btn">
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="game-area">
        <canvas ref={canvasRef} width={600} height={500} className="racing-canvas" />

        {!gameStarted && countdown === null && !gameOver && (
          <div className="instructions-overlay">
            <h3>Controls:</h3>
            <p>Player 1: Left/Right Arrow Keys</p>
            {/* single player only */}
            <p>Avoid obstacles and collect power-ups!</p>
          </div>
        )}
      </div>

      <div className="game-info">
        <div className="player-info">
          <span className="player-name">{player1Name}</span>
          {gameStateRef.current.shield.player1 && <span className="power-up-indicator shield">🛡️</span>}
          {gameStateRef.current.speedBoost.player1 > 0 && <span className="power-up-indicator speed">⚡</span>}
        </div>

        {/* single player only - player2 removed */}
      </div>
    </div>
  );
};

export default CarRacing;
