import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import "./App.css";
import { Navbar } from "./component/Navbar";
import HomePage from "./pages/Home";
import GamePage from "./pages/Game";
import NotFound from "./pages/NotFoundPage";

function Layout() {
  return (
    <div className="gamehub-home">
      <Navbar />
      <div className="gamehub-content">
        <Outlet />
      </div>
    </div>
  );
}

const baseUrl = import.meta.env.BASE_URL || "/GameHub/";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, 
    children: [
      {
        path: "",
        element: <HomePage />
      },
      {
        path: "game/:gameName",
        element: <GamePage />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
], {
  basename: baseUrl
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
