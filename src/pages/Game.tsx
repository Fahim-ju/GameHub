import React from "react";
import { useParams } from "react-router";
import { EnumGameId } from "../core/enum/EnumGameId";
import Loading from "../component/common/Loading";

const GamePage: React.FC = () => {
  const { gameName } = useParams<{ gameName: string }>();

  if (gameName === EnumGameId.TicTacToe) {
    const TicTacToe = React.lazy(() => import("../games/TicTacToe"));
    return (
      <React.Suspense fallback={<Loading />}>
        <div className="tictactoe-container">
          <TicTacToe />
        </div>
      </React.Suspense>
    );
  }
};

export default GamePage;
