import { useEffect, useRef } from "react";
import GameCard from "../component/GameCard";
import { EnumGameId } from "../core/enum/EnumGameId";
import { motion } from "framer-motion";
import { animate, stagger } from "animejs";

function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple animation for the hero text
    if (heroRef.current) {
      animate(heroRef.current.querySelectorAll(".animate-text"), {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: stagger(100),
        duration: 800,
        easing: "easeOutQuad",
      });
    }
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="home-container">
      <div ref={heroRef} className="hero-section">
        <h1 className="hero-title animate-text">
          <span className="text-gradient">GameHub</span>
        </h1>
        <p className="hero-subtitle animate-text">Your portal to an exciting collection of classic and modern games</p>
        <div className="hero-decoration animate-text">
          <div className="glow-effect"></div>
        </div>
      </div>

      <div className="games-section">
        <h2 className="section-title">Featured Games</h2>
        <motion.div className="game-list" variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <GameCard
              id={EnumGameId.TicTacToe}
              name="Tic-Tac-Toe"
              description="Challenge your strategic thinking with this classic 3x3 grid game"
            />
          </motion.div>
          <motion.div variants={item}>
            <GameCard id={EnumGameId.Snake} name="Snake" description="Navigate the snake to eat food and grow longer" />
          </motion.div>
          {/* Add more games here */}
          <motion.div variants={item}>
            <GameCard
              id={EnumGameId.CarRacing}
              name="Car Racing"
              description="Experience the thrill of high-speed racing in this adrenaline-pumping game"
            />
          </motion.div>
          <motion.div variants={item}>
            <GameCard
              id={EnumGameId.Mario}
              name="Mario"
              description="Run, jump, and explore a classic platforming adventure (prototype)"
            />
          </motion.div>
          <motion.div variants={item}>
            <GameCard
              id={EnumGameId.TicTacToe}
              name="Tic-Tac-Toe"
              description="Challenge your strategic thinking with this classic 3x3 grid game"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default HomePage;
