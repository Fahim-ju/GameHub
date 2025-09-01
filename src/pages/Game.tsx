import React from "react";
import { useParams } from "react-router";
import { EnumGameId } from "../core/enum/EnumGameId";
import Loading from "../component/common/Loading";

const GamePage: React.FC = () => {
  const { gameName } = useParams<{ gameName: string }>();

  if (gameName === EnumGameId.TicTacToe) {
    const TicTacToeInitialPage = React.lazy(() => import("../games/tictactoe/TicTacToeInitialPage"));
    return (
      <React.Suspense fallback={<Loading />}>
        <div className="tictactoe-container">
          <TicTacToeInitialPage />
        </div>
      </React.Suspense>
    );
  } else if (gameName === EnumGameId.CarRacing) {
    const CarRacingInitialPage = React.lazy(() => import("../games/carracing/CarRacingInitialPage"));
    return (
      <React.Suspense fallback={<Loading />}>
        <div className="carracing-container">
          <CarRacingInitialPage />
        </div>
      </React.Suspense>
    );
  } else if (gameName === EnumGameId.Snake) {
    const SnakeInitialPage = React.lazy(() => import("../games/snake/SnakeInitialPage"));
    return (
      <React.Suspense fallback={<Loading />}>
        <div className="snake-container">
          <SnakeInitialPage />
        </div>
      </React.Suspense>
    );
  }
};

export default GamePage;
