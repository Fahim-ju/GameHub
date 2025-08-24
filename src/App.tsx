import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import { Navbar } from "./component/Navbar";
import HomePage from "./pages/Home";
import GamePage from "./pages/Game";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/game/:gameName",
    element: <GamePage />,
  },
]);

function App() {
  return (
    <div className="gamehub-home">
      <Navbar />
      <div className="gamehub-content">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
