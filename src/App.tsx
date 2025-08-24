
import "./App.css";
import { NavbarNew } from "./component/Navbar";

function App() {
  

  return (
    <div className="gamehub-home">
      <NavbarNew />
      <div className="gamehub-content">
        <h1>GameHub</h1>
        <h2 className="logo" >Select a Game</h2>
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
