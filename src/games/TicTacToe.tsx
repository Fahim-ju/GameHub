import { AnimatePresence, motion } from "framer-motion";
import Square from "../component/tictactoe/Square";
import { useTicTacToe } from "../core/enum/hooks/tictactoe";
import Button from "../component/tictactoe/Button";
import type { TicTacToeGameSettings } from "../core/models/TicTacToeModels";
import { useNavigate } from "react-router";
import "../styles/tictactoe-player-info.css";

function TicTacToe(gameSettings: TicTacToeGameSettings) {
  console.log("Game settings:", gameSettings);
  const navigate = useNavigate();

  const { squares, turn, winner, isAiMode, difficulty, updateSquares, resetGame, changeDifficulty } = useTicTacToe(gameSettings);

  const getWinnerName = () => {
    if (winner === "x | o") return "It's a Tie!";
    if (winner === "x") return `${gameSettings.player1Name} Wins!`;
    return isAiMode ? "Computer Wins!" : `${gameSettings.player2Name} Wins!`;
  };

  return (
    <div className="tic-tac-toe">
      <h1>
        TIC-TAC-TOE
        {isAiMode ? ` (AI Mode - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level)` : ""}
      </h1>
      <div className="game-controls">
        <Button resetGame={resetGame} text="Reset Game" />
        {isAiMode && (
          <button onClick={changeDifficulty} className="difficulty-toggle">
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </button>
        )}
      </div>
      <div className="game">
        {Array.from("012345678").map((ind) => (
          <Square key={ind} ind={Number(ind)} updateSquares={updateSquares} clsName={squares[Number(ind)]} />
        ))}
      </div>
      <div className="player-info">
        <div className={`player ${turn === "x" ? "active" : ""}`}>
          <motion.div
            className="player-avatar"
            animate={{
              scale: turn === "x" ? 1.1 : 0.95,
              boxShadow: turn === "x" ? "0 0 20px rgba(255, 0, 136, 0.6)" : "none",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Square clsName="x" />
          </motion.div>
          <motion.div
            className="player-name"
            animate={{
              color: turn === "x" ? "#ff0088" : "#aaa",
              scale: turn === "x" ? 1.05 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {gameSettings.player1Name}
          </motion.div>
        </div>
        <motion.div
          className="turn-indicator"
          animate={{
            x: turn === "x" ? "-90%" : "90%" /* Increased offset to position properly over each player */,
            backgroundColor: turn === "x" ? "#ff0088" : "#ffa02e",
            color: turn === "x" ? "#ff0088" : "#ffa02e" /* For the arrow pointer color */,
          }}
          initial={{
            x: 0,
            y: -20,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.span animate={{ opacity: 1 }} initial={{ opacity: 0 }} key={turn} transition={{ duration: 0.2 }}>
            <span style={{ color: "#ffffff" }}>
              Thinking
              <motion.span
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  times: [0, 0.2, 0.4, 0.6, 1]
                }}
              >.</motion.span>
              <motion.span
                animate={{
                  opacity: [0, 0, 1, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  times: [0, 0.2, 0.4, 0.6, 1]
                }}
              >.</motion.span>
              <motion.span
                animate={{
                  opacity: [0, 0, 0, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  times: [0, 0.2, 0.4, 0.6, 1]
                }}
              >.</motion.span>
            </span>
          </motion.span>
        </motion.div>
        <div className={`player ${turn === "o" ? "active" : ""}`}>
          <motion.div
            className="player-avatar"
            animate={{
              scale: turn === "o" ? 1.1 : 0.95,
              boxShadow: turn === "o" ? "0 0 20px rgba(255, 160, 46, 0.6)" : "none",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Square clsName="o" />
          </motion.div>
          <motion.div
            className="player-name"
            animate={{
              color: turn === "o" ? "#ffa02e" : "#aaa",
              scale: turn === "o" ? 1.05 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {isAiMode ? "Computer" : gameSettings.player2Name}
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {winner && (
          <motion.div
            key={"parent-box"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="winner"
          >
            <motion.div
              key={"child-box"}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{
                scale: 0.8,
                opacity: 0,
                y: 20,
              }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 200,
              }}
              className="text"
            >
              <motion.h2
                initial={{
                  scale: 0,
                  y: 20,
                }}
                animate={{
                  scale: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    damping: 12,
                    stiffness: 200,
                    delay: 0.3,
                    duration: 0.5,
                  },
                }}
              >
                {getWinnerName()}
              </motion.h2>
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                  transition: {
                    delay: 1.3,
                    duration: 0.2,
                  },
                }}
                className="win"
              >
                {winner === "x | o" ? (
                  <>
                    <Square clsName="x" />
                    <Square clsName="o" />
                  </>
                ) : (
                  <>
                    <Square clsName={winner} />
                  </>
                )}
              </motion.div>
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                  transition: {
                    delay: 1.5,
                    duration: 0.3,
                  },
                }}
                className="winner-buttons"
              >
                <Button resetGame={resetGame} text="Play Again" />
                <motion.button onClick={() => navigate("/")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="home-btn">
                  Go Home
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TicTacToe;
