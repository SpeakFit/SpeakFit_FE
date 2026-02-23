import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import LandingPage from "../pages/LandingPage";
import { ROUTES } from "./routes.const";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: ROUTES.LANDING, element: <LandingPage /> },
      // { path: ROUTES.LOGIN, element: <LoginPage /> },
    ],
  },
]);
