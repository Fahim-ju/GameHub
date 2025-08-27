import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import { Navbar } from "./component/Navbar";
import HomePage from "./pages/Home";
import GamePage from "./pages/Game";
import NotFound from "./pages/NotFoundPage";

const baseUrl = import.meta.env.BASE_URL || "/GameHub/";
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/game/:gameName",
    element: <GamePage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
],{
  basename: baseUrl // Use the base URL here
});

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
