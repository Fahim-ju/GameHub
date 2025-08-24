import GameCard from "../component/GameCard";
import { EnumGameId } from "../core/enum/EnumGameId";

function HomePage() {
  return (
    <div>
      <h2 className="logo">Select a Game</h2>
      <div className="game-list">
        <GameCard id={EnumGameId.TicTacToe} name="Tic-Tac-Toe" description="Classic 3x3 grid game" />
        <GameCard id={EnumGameId.Sudoku} name="Sudoku" description="Fill the grid with numbers" />
        {/* Add more games here */}
      </div>
    </div>
  );
}

export default HomePage;
