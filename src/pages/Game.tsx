import React from "react";
import { useParams } from "react-router";

const GamePage: React.FC = () => {
  const { gameName } = useParams<{ gameName: string }>();

  return (
    <div className="game-page">
      <h1>Welcome to {gameName}!</h1>
      <p>Enjoy playing {gameName}.</p>
    </div>
  );
};

export default GamePage;
