import { useNavigate } from "react-router";
import type { GameId } from "../core/enum/EnumGameId";

type GameCardProps = {
  id: GameId;
  name: string;
  description: string;
};

function GameCard({ id, name, description }: GameCardProps) {
  const navigate = useNavigate();
  const playGame = (gameName: string) => {
    navigate(`/game/${gameName}`);
  };
  return (
    <div className="game-card">
      <h3>{name}</h3>
      <p>{description}</p>
      <button onClick={() => playGame(id)}>Play</button>
    </div>
  );
}

export default GameCard;
