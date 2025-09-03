import React, { useCallback, useEffect, useRef, useState } from "react";
import type { MarioGameSettings } from "../../core/models/MarioGameModels";
import "./styles/mario.css";

interface MarioGameProps extends MarioGameSettings {
  backToSettings: () => void;
}

interface Obstacle {
  id: number;
  x: number;
  width: number;
  height: number;
  color: string;
  passed: boolean;
}

interface DifficultyConfig {
  speed: number;           // horizontal world speed (px/sec)
  spawnMin: number;        // ms
  spawnMax: number;        // ms
  gravity: number;         // px/sec^2
  jumpVelocity: number;    // px/sec upward
}

// Life pickup (heart)
interface HeartPickup {
  id: number;
  x: number;
  size: number;
  heightAboveGround: number; // vertical placement above ground baseline
  collected: boolean;
  hue: number; // color variance for gradient
}

const difficultyConfigs: Record<MarioGameSettings["difficulty"], DifficultyConfig> = {
  easy:   { speed: 260, spawnMin: 1600, spawnMax: 2300, gravity: 1550, jumpVelocity: 620 },
  normal: { speed: 330, spawnMin: 1200, spawnMax: 1900, gravity: 1700, jumpVelocity: 650 },
  hard:   { speed: 420, spawnMin: 900,  spawnMax: 1500, gravity: 1850, jumpVelocity: 700 },
};

const MarioGame: React.FC<MarioGameProps> = ({ playerName, difficulty, backToSettings }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const resizeTimeoutRef = useRef<number | null>(null);

  // Game state
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  // Score shown in UI (integer). We accumulate actual progress in a ref and only update state ~10fps to avoid layout thrash.
  const [score, setScore] = useState(0); // distance in meters (integer)
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // Internal refs for performance
  const obstaclesRef = useRef<Obstacle[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const nextSpawnDelayRef = useRef<number>(0);
  // Hearts
  const heartsRef = useRef<HeartPickup[]>([]);
  const heartLastSpawnRef = useRef<number>(0);
  const heartNextSpawnDelayRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const scoreRef = useRef<number>(0); // precise accumulated score (float)
  const lastScoreUiUpdateRef = useRef<number>(0); // timestamp of last React state update

  // Player physics
  const playerRef = useRef({
    x: 120,
    y: 0,
    vy: 0,
    width: 48,
    height: 54,
    grounded: true,
  });

  const config = difficultyConfigs[difficulty];
  const [livesFlash, setLivesFlash] = useState(false);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const shell = shellRef.current; if (!shell) return;
    const w = shell.clientWidth;
    const h = Math.round(w * 9/16); // maintain 16:9
    const dpr = window.devicePixelRatio || 1;
    // Skip if size unchanged to avoid triggering additional layout / flicker
    if (canvas.width === w * dpr && canvas.height === h * dpr) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Reset any previous scaling (was causing compounding scale + flicker when resize fired repeatedly)
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Spawn logic
  const scheduleNextSpawn = useCallback((now: number) => {
    // Flight time of a full jump (seconds)
    const flightTime = (2 * config.jumpVelocity) / config.gravity; // up + down
    // Difficulty-based gap factor (portion of full flight time we want as MIN between obstacle spawns)
    const gapFactorMap: Record<MarioGameSettings["difficulty"], number> = { easy: 0.70, normal: 0.60, hard: 0.50 };
    const gapFactor = gapFactorMap[difficulty];
    // Previous obstacle (if any)
    const prev = obstaclesRef.current[obstaclesRef.current.length - 1];
    // Additional width compensation in seconds (so wider previous obstacle gives a bit more gap)
    const widthCompSec = prev ? (prev.width / config.speed) * 1.15 : 0; // 15% buffer
    // Base minimum gap time (seconds)
    const minGapSec = flightTime * gapFactor + widthCompSec;
    const minGapMs = minGapSec * 1000;

    // Random candidate delay
    let delay = config.spawnMin + Math.random() * (config.spawnMax - config.spawnMin);
    if (delay < minGapMs) {
      // Push delay up, but reintroduce slight randomness so patterns feel organic
      const extra = (Math.random() * 0.35 + 0.15) * minGapMs; // 15% - 50% of min gap extra variability
      delay = minGapMs + extra;
    }
    lastSpawnRef.current = now;
    nextSpawnDelayRef.current = delay;
  }, [config.spawnMin, config.spawnMax, config.jumpVelocity, config.gravity, config.speed, difficulty]);

  const spawnObstacle = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const h = canvas.height / window.devicePixelRatio;
    const groundY = h - 70; // ground baseline
    const baseHeight = 32 + Math.random() * 42; // candidate height
    const width = 32 + Math.random() * 28; // obstacle width
    const colors = ["#ff4d4d", "#ff8c1a", "#ffd31a", "#1affd1", "#ff1aaf"]; // palette
    const flightTime = (2 * config.jumpVelocity) / config.gravity; // total air time of a full jump (s)
    const jumpApex = (config.jumpVelocity * config.jumpVelocity) / (2 * config.gravity); // max vertical reach (px)
    // Height clamp: never exceed (apex - clearance) & 55% of ground clearance
    const clearance = 14; // pixels below apex to ensure player clearance
    const maxAllowed = Math.min(jumpApex - clearance, groundY * 0.55);
    const obstacle: Obstacle = {
      id: performance.now() + Math.random(),
      x: (canvas.width / window.devicePixelRatio) + 20,
      width,
      height: Math.max(24, Math.min(baseHeight, maxAllowed)),
      color: colors[Math.floor(Math.random()*colors.length)],
      passed: false,
    };
    // Horizontal gap constraint with previous obstacle so player can execute distinct jumps:
    // Need time to finish prior jump & (optionally) re-jump. Use portion of flight time plus width influence.
    const prev = obstaclesRef.current[obstaclesRef.current.length - 1];
    if (prev) {
      // Minimal time gap: 55% of full flight + small landing window (0.08s) scaled by difficulty (hard reduces by 10%)
      const landingWindow = 0.08;
      const difficultyFactor: Record<MarioGameSettings["difficulty"], number> = { easy: 1.0, normal: 0.9, hard: 0.8 };
      const minTimeGap = (flightTime * 0.55 + landingWindow) * difficultyFactor[difficulty];
      // Add influence of previous obstacle width (convert to time by dividing by speed, scaled)
      const widthTime = (prev.width / config.speed) * 0.5;
      const requiredTime = minTimeGap + widthTime;
      const requiredPx = requiredTime * config.speed;
      const currentGap = obstacle.x - (prev.x + prev.width);
      if (currentGap < requiredPx) {
        obstacle.x = prev.x + prev.width + requiredPx;
      }
    }
    obstaclesRef.current.push(obstacle);
  }, [config.gravity, config.jumpVelocity, config.speed, difficulty]);

  // Schedule next heart spawn (rarer than obstacles)
  const scheduleNextHeart = useCallback((now: number) => {
    const ranges: Record<MarioGameSettings["difficulty"], [number, number]> = {
      easy: [9000, 14000],
      normal: [10000, 16000],
      hard: [11000, 17000]
    };
    const [minH, maxH] = ranges[difficulty];
    heartLastSpawnRef.current = now;
    heartNextSpawnDelayRef.current = minH + Math.random() * (maxH - minH);
  }, [difficulty]);

  // Spawn heart pickup
  const spawnHeart = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const size = 34 + Math.random()*10; // 34-44
    const heightAboveGround = 110 + Math.random()*70; // vertical position variation
    const hue = 330 + Math.random()*30; // pink-red range
    const heart: HeartPickup = {
      id: performance.now() + Math.random(),
      x: (canvas.width / window.devicePixelRatio) + 60,
      size,
      heightAboveGround,
      collected: false,
      hue
    };
    // Ensure not too close to previous heart
    const prev = heartsRef.current[heartsRef.current.length - 1];
    if (prev && heart.x - prev.x < 420) heart.x = prev.x + 420;
    heartsRef.current.push(heart);
  }, []);

  // Input handling
  const attemptJump = useCallback(() => {
    if (!isRunning || gameOver) return;
    const player = playerRef.current;
    if (player.grounded) {
      player.vy = -config.jumpVelocity;
      player.grounded = false;
    }
  }, [config.jumpVelocity, isRunning, gameOver]);

  const togglePause = useCallback(() => {
    if (gameOver) return;
    setIsPaused(p => !p);
  }, [gameOver]);

  const resetGame = useCallback(() => {
  setScore(0);
  scoreRef.current = 0;
  lastScoreUiUpdateRef.current = 0;
    setLives(3);
    setGameOver(false);
    setIsRunning(true);
    obstaclesRef.current = [];
    heartsRef.current = [];
    playerRef.current.y = 0; playerRef.current.vy = 0; playerRef.current.grounded = true;
    lastSpawnRef.current = 0; nextSpawnDelayRef.current = 0; lastTsRef.current = 0;
    heartLastSpawnRef.current = 0; heartNextSpawnDelayRef.current = 0;
    // Spawn an initial obstacle shortly after reset so player sees one
    setTimeout(() => { spawnObstacle(); }, 500);
    // Delay first heart so player settles
    setTimeout(() => { spawnHeart(); }, 3500);
  }, [spawnObstacle, spawnHeart]);

  // Main loop effect: dependencies intentionally exclude 'score' to avoid reinitializing spawn timers each frame
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); attemptJump(); }
      else if (e.code === "KeyP") { togglePause(); }
      else if (e.code === "KeyR") { resetGame(); }
      else if (e.code === "Escape") { backToSettings(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attemptJump, togglePause, resetGame, backToSettings]);

  // Pause on tab hidden
  useEffect(() => {
    const onVis = () => { if (document.hidden) setIsPaused(true); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;

    const render = (ts: number) => {
      rafRef.current = requestAnimationFrame(render);
      if (!isRunning || isPaused) { lastTsRef.current = ts; return; }
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; // seconds
      lastTsRef.current = ts;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const groundY = height - 70; // ground baseline

      // Physics update
      const player = playerRef.current;
      player.vy += config.gravity * dt;
      player.y += player.vy * dt;
      if (player.y > 0) { player.y = 0; player.vy = 0; player.grounded = true; }

      // Ensure spawn schedule exists
      if (nextSpawnDelayRef.current <= 0) {
        scheduleNextSpawn(ts);
      }
      // Spawn obstacles when delay elapsed
      if (ts - lastSpawnRef.current > nextSpawnDelayRef.current) {
        spawnObstacle();
        scheduleNextSpawn(ts);
      }

      // Heart spawn schedule
      if (heartNextSpawnDelayRef.current <= 0) scheduleNextHeart(ts);
      if (ts - heartLastSpawnRef.current > heartNextSpawnDelayRef.current) {
        spawnHeart();
        scheduleNextHeart(ts);
      }

  // Update obstacles positions
      const obs = obstaclesRef.current;
      for (let i=0;i<obs.length;i++) {
        obs[i].x -= config.speed * dt;
      }
      // Remove off-screen
      while (obs.length && obs[0].x + obs[0].width < -40) obs.shift();

  // Update hearts positions
  const hearts = heartsRef.current;
  for (let i=0;i<hearts.length;i++) hearts[i].x -= config.speed * dt;
  while (hearts.length && hearts[0].x + hearts[0].size < -40) hearts.shift();

  // Collision detection
  const playerTop = groundY - player.height + player.y; // y negative when airborne
    // Adjusted playerTop calculation for clarity
      const playerLeft = player.x;
      const playerRight = player.x + player.width;
      const playerBottom = groundY + player.y; // y negative reduces bottom
      for (let i=0;i<obs.length;i++) {
        const o = obs[i];
        const oTop = groundY - o.height;
        const oBottom = groundY;
        const oLeft = o.x;
        const oRight = o.x + o.width;
        if (playerRight > oLeft && playerLeft < oRight && playerBottom > oTop && playerTop < oBottom) {
          // collision
          obs.splice(i,1); i--;
          setLives(l => {
            const nl = l - 1;
            if (nl <= 0) {
              setGameOver(true); setIsRunning(false); setHighScore(h => Math.max(h, Math.floor(scoreRef.current)));
            } else {
              // brief invulnerability / knockback
              player.vy = -config.jumpVelocity * .6;
              player.grounded = false;
            }
            return nl;
          });
          break;
        }
        if (!o.passed && oRight < player.x) {
          o.passed = true;
        }
      }

      // Heart collision (AABB approximation)
      for (let i=0;i<hearts.length;i++) {
        const heart = hearts[i]; if (heart.collected) continue;
        const hx = heart.x; const hs = heart.size;
        const hTop = groundY - heart.heightAboveGround - hs*0.5; // approximate top
        const hBottom = hTop + hs; // approximate bottom
        if (playerRight > hx && playerLeft < hx + hs && playerBottom > hTop && playerTop < hBottom) {
          heart.collected = true;
          setLives(l => {
            const next = Math.min(l + 1, 9); // cap lives
            if (next !== l) {
              setLivesFlash(true);
              setTimeout(() => setLivesFlash(false), 600);
            }
            return next;
          });
        }
      }
      // Remove collected hearts
      for (let i=hearts.length-1;i>=0;i--) if (hearts[i].collected) hearts.splice(i,1);

      // Score accumulation (distance -> convert px to meters). Throttle UI updates to reduce layout flicker.
      scoreRef.current += (config.speed * dt) / 50;
      if (ts - lastScoreUiUpdateRef.current > 100) { // update roughly every 100ms
        lastScoreUiUpdateRef.current = ts;
        setScore(Math.floor(scoreRef.current));
      }

      // Drawing
      ctx.clearRect(0,0,width,height);
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0,0,0,height);
      skyGrad.addColorStop(0, "#142135");
      skyGrad.addColorStop(.6, "#1d2d44");
      skyGrad.addColorStop(1, "#09131f");
      ctx.fillStyle = skyGrad; ctx.fillRect(0,0,width,height);

      // Parallax layers (simple lines / hills)
      ctx.strokeStyle = "#1f3a55"; ctx.lineWidth = 2;
      const offset = (ts/40) % width;
      for (let x=-offset; x<width; x+=120) {
        ctx.beginPath(); ctx.moveTo(x, groundY-140); ctx.lineTo(x+60, groundY-160); ctx.lineTo(x+120, groundY-140); ctx.stroke();
      }

      // Road
      ctx.fillStyle = "#202730"; ctx.fillRect(0, groundY-10, width, 10);
      ctx.fillStyle = "#282f38"; ctx.fillRect(0, groundY, width, height-groundY);
      // Lane stripes
      const laneOffset = (ts/6) % 80;
      ctx.fillStyle = "#ffd34d";
      for (let x=-laneOffset; x<width; x+=80) {
        ctx.fillRect(x, groundY + 16, 50, 6);
      }

  // Obstacles (support browsers without roundRect)
  // Type guard for roundRect support
  type CtxWithRoundRect = CanvasRenderingContext2D & { roundRect?: (x:number,y:number,w:number,h:number,radius:number|number[])=>CanvasRenderingContext2D };
  const ctxRR = ctx as CtxWithRoundRect;
  const hasRoundRect = typeof ctxRR.roundRect === "function";
      for (const o of obs) {
        const grad = ctx.createLinearGradient(o.x,0,o.x+o.width,0);
        grad.addColorStop(0,"#111"); grad.addColorStop(1,o.color);
        ctx.fillStyle = grad;
        ctx.beginPath();
        if (hasRoundRect && ctxRR.roundRect) {
          ctxRR.roundRect(o.x, groundY - o.height, o.width, o.height, 6);
        } else {
          ctx.rect(o.x, groundY - o.height, o.width, o.height);
        }
        ctx.fill();
        ctx.shadowColor = o.color + "99"; ctx.shadowBlur = 8; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        ctx.fillStyle = o.color + "33"; ctx.fillRect(o.x, groundY - 2, o.width, 2);
        ctx.shadowBlur = 0;
      }

      // Hearts (draw after obstacles, before player)
      const t = ts / 1000;
      for (const heart of hearts) {
        const bob = Math.sin(t * 3 + heart.id) * 6;
        const pulse = (Math.sin(t * 6 + heart.id) * 0.15) + 0.85;
        const s = heart.size * pulse;
        const x = heart.x;
        const y = groundY - heart.heightAboveGround + bob;
        const grad = ctx.createLinearGradient(x, y, x, y + s);
        grad.addColorStop(0, `hsl(${heart.hue} 95% 70%)`);
        grad.addColorStop(1, `hsl(${heart.hue} 70% 48%)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        // Heart shape path
        ctx.moveTo(x + s/2, y + s*0.75);
        ctx.bezierCurveTo(x + s*1.15, y + s*0.25, x + s*0.85, y - s*0.2, x + s/2, y + s*0.05);
        ctx.bezierCurveTo(x + s*0.15, y - s*0.2, x - s*0.15, y + s*0.25, x + s/2, y + s*0.75);
        ctx.fill();
        // Glow
        ctx.shadowColor = `hsl(${heart.hue} 100% 65% / .65)`; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
        // Outline
        ctx.lineWidth = 1.8; ctx.strokeStyle = `hsl(${heart.hue} 60% 35%)`; ctx.stroke();
        // Sparkle highlight
        ctx.fillStyle = "rgba(255,255,255,.75)";
        ctx.beginPath(); ctx.ellipse(x + s*0.62, y + s*0.18, s*0.12, s*0.18, -0.7, 0, Math.PI*2); ctx.fill();
      }

      // Player (simple styled capsule)
      const pX = player.x; const pY = groundY - player.height + player.y; // y negative lifts
      const bodyGrad = ctx.createLinearGradient(pX,pY,pX, pY+player.height);
      bodyGrad.addColorStop(0,"#ff4fb0"); bodyGrad.addColorStop(.6,"#ff2a7e"); bodyGrad.addColorStop(1,"#b80052");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(pX, pY, player.width, player.height, 14);
      ctx.fill();
      // face
      ctx.fillStyle = "#ffe2d5";
      ctx.beginPath(); ctx.roundRect(pX+10, pY+12, player.width-20, 22, 8); ctx.fill();
      // eye
      ctx.fillStyle = "#222"; ctx.fillRect(pX+20, pY+18, 6, 12); ctx.fillRect(pX+player.width-26, pY+18, 6, 12);
      // hat
      ctx.fillStyle = "#ff0055"; ctx.fillRect(pX+4, pY+4, player.width-8, 12);
      ctx.fillStyle = "#ff8abf"; ctx.fillRect(pX+6, pY+6, player.width-12, 4);

      // Shadow oval
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      const shadowScale = player.grounded ? 1 : 1 + player.y/120; // y negative shrinks
      ctx.beginPath(); ctx.ellipse(pX+player.width/2, groundY + 8, 30*shadowScale, 10*shadowScale, 0,0,Math.PI*2); ctx.fill();

      // Game over overlay (drawn by React overlay, but also faint tint)
      if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0,0,width,height);
      }
    };

  // Immediate first obstacle for visibility
  spawnObstacle();
  scheduleNextSpawn(performance.now());
  scheduleNextHeart(performance.now() + 4000);
    rafRef.current = requestAnimationFrame(render);
  return () => cancelAnimationFrame(rafRef.current);
  }, [config.gravity, config.jumpVelocity, config.speed, isPaused, isRunning, gameOver, scheduleNextSpawn, spawnObstacle, scheduleNextHeart, spawnHeart]);

  // Resize
  useEffect(() => {
    const shell = shellRef.current; if (!shell) return;
    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize calls to prevent flickering
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeCanvas();
        resizeTimeoutRef.current = null;
      }, 100);
    });
    resizeObserver.observe(shell);
    // Initial resize
    resizeCanvas();
    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [resizeCanvas]);

  useEffect(() => { setHighScore(h => Math.max(h, Math.floor(score))); }, [gameOver, score]);

  return (
    <div className="mario-game-wrapper">
      <div className="mario-game-top-bar">
        <div className="score-panel">
          <div className="player-block">
            <span className="label">Player</span>
            <span className="player-name" title={playerName}>{playerName || "Player"}</span>
          </div>
          <div className="divider" />
          <div className="score-block">
            <span className="label">Score</span>
            <span className="score-value">{Math.floor(score)}</span>
          </div>
          <div className="divider" />
            <div className="score-block">
              <span className="label">Best</span>
              <span className="score-value">{Math.floor(highScore)}</span>
            </div>
          <div className="divider" />
          <div className="score-block">
            <span className="label">Lives</span>
            <span className={`score-value lives ${lives<=1?"danger":""} ${livesFlash?"gain":""}`}>{lives}</span>
          </div>
          <div className="divider" />
          <div className="score-block">
            <span className="label">Mode</span>
            <span className="difficulty-badge" data-diff={difficulty}>{difficulty}</span>
          </div>
        </div>
        <div className="controls-inline">
          <button onClick={attemptJump} disabled={gameOver}>Jump</button>
          <button onClick={togglePause} disabled={gameOver}>{isPaused?"Resume":"Pause"}</button>
          <button onClick={resetGame}>Restart</button>
          <button onClick={backToSettings}>Back</button>
        </div>
      </div>
      <div className="canvas-shell" ref={shellRef}>
        <canvas ref={canvasRef} aria-label="Mario Runner Game" />
        {gameOver && (
          <div className="overlay">
            <div className="dialog">
              <h2>Game Over</h2>
              <p>Your Score: <strong>{Math.floor(score)}</strong></p>
              <p>Best: <strong>{Math.floor(highScore)}</strong></p>
              <div className="buttons">
                <button onClick={resetGame}>Play Again (R)</button>
                <button onClick={backToSettings}>Settings (Esc)</button>
              </div>
              <small>Press Space / ↑ to jump. P to pause.</small>
            </div>
          </div>
        )}
        {!gameOver && isPaused && (
          <div className="overlay paused"><div className="dialog compact"><h3>Paused</h3><p>Press P to resume</p></div></div>
        )}
      </div>
      <div className="hint-bar">
        <span>Space / ↑ Jump • P Pause • R Restart • Esc Back</span>
      </div>
    </div>
  );
};

export default MarioGame;
