import React from "react";
import { useParams } from "react-router";
import { EnumGameId } from "../core/enum/EnumGameId";
import Loading from "../component/common/Loading";

const GamePage: React.FC = () => {
  const { gameName } = useParams<{ gameName: string }>();

  if (gameName === EnumGameId.TicTacToe) {
    const TicTacToeInitialPage = React.lazy(() => import("../games/TicTacToeInitialPage"));
    return (
      <React.Suspense fallback={<Loading />}>
        <div className="tictactoe-container">
          <TicTacToeInitialPage />
        </div>
      </React.Suspense>
    );
  }
};

export default GamePage;
