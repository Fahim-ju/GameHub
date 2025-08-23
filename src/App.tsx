import { createScope, animate, createSpring, createDraggable, Scope } from "animejs";
import { useRef, useState, useEffect } from "react";
import "./App.css";
import { NavbarNew } from "./component/Navbar";

function App() {
  const root = useRef(null);
  const scope = useRef<Scope>(null);
  const [rotations, setRotations] = useState(0);

  useEffect(() => {
    scope.current = createScope({ root }).add((self) => {
      // Every anime.js instances declared here are now scopped to <div ref={root}>

      // Created a bounce animation loop
      animate(".logo", {
        scale: [
          { to: 1.25, ease: "inOut(3)", duration: 200 },
          { to: 1, ease: createSpring({ stiffness: 300 }) },
        ],
        loop: true,
        loopDelay: 250,
      });

      // Make the logo draggable around its center
      createDraggable(".logo", {
        container: [0, 0, 0, 0],
        releaseEase: createSpring({ stiffness: 200 }),
      });

      // Register function methods to be used outside the useEffect
      self?.add("rotateLogo", (i) => {
        animate(".logo", {
          rotate: i * 360,
          ease: "out(4)",
          duration: 1500,
        });
      });
    });

    // Properly cleanup all anime.js instances declared inside the scope
    return () => scope.current?.revert();
  }, []);

  const handleClick = () => {
    setRotations((prev) => {
      const newRotations = prev + 1;
      // Animate logo rotation on click using the method declared inside the scope
      scope.current?.methods.rotateLogo(newRotations);
      return newRotations;
    });
  };

  return (
    <div ref={root} className="gamehub-home">
      <NavbarNew />
      <div className="gamehub-content">
        <h1>GameHub</h1>
        <h2 className="logo" onClick={handleClick}>Select a Game</h2>
        <div className="game-list">
          <GameCard name="Tic-Tac-Toe" description="Classic 3x3 grid game" />
          <GameCard name="Sudoku" description="Fill the grid with numbers" />
          {/* Add more games here */}
        </div>
      </div>
    </div>
  );
}

type GameCardProps = {
  name: string;
  description: string;
};

function GameCard({ name, description }: GameCardProps) {
  return (
    <div className="game-card">
      <h3>{name}</h3>
      <p>{description}</p>
      <button disabled>Play</button>
    </div>
  );
}

export default App;
