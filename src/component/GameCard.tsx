import { useNavigate } from "react-router";
import { EnumGameId, type GameId } from "../core/enum/EnumGameId";
import { useState } from "react";

type GameCardProps = {
  id: GameId;
  name: string;
  description: string;
};

function GameCard({ id, name, description }: GameCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const playGame = (gameName: string) => {
    navigate(`/game/${gameName}`);
  };
  
  // Get background images based on the game and hover state
  const getGameBackground = (gameId: GameId, isHovered: boolean) => {
    if (gameId === EnumGameId.TicTacToe) {
      return isHovered ? 
        { 
          backgroundImage: `url('/GameHub/TicTacToePlaying.gif')`,
          backgroundColor: 'transparent' // Ensure no background color is interfering
        } : 
        { 
          backgroundImage: `url('/GameHub/tictactoestill.png')`, 
          backgroundColor: 'transparent' // Ensure no background color is interfering
        };
    }
    return {}; // Default empty style for other games
  };
  
  // Check if this is the TicTacToe card to apply special styling
  const isTicTacToe = id === EnumGameId.TicTacToe;
  
  return (
    <div 
      className={`game-card ${isHovered ? 'hovered' : ''} ${isTicTacToe ? 'tictactoe-card' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => playGame(id)}
      style={getGameBackground(id, isHovered)}
    >
      {/* Optional overlay - uncomment if text becomes unreadable */}
      {/* {isTicTacToe && <div className="game-card-overlay"></div>} */}
      
      {/* Info container that slides up on hover */}
      <div className="game-info-container">
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default GameCard;
