import { createBrowserRouter } from "react-router-dom";
import FooterLayout from "../components/FooterLayout";
import Layout from "../components/DefaultLayout";
import PracticeLayout from "../components/PracticeLayout";
import LandingPage from "../pages/landing/LandingPage";
import SignupPage from "../pages/signup/SignupPage";
import ScriptPage from "../pages/script/ScriptPage";
import PracticePage from "../pages/practice/PracticePage";
import { ROUTES } from "./routes.const";

export const router = createBrowserRouter([
  {
    element: <FooterLayout />,
    children: [{ path: ROUTES.LANDING, element: <LandingPage /> }],
  },
  {
    element: <Layout />,
    children: [
      { path: ROUTES.SIGNUP, element: <SignupPage /> },
      { path: ROUTES.SCRIPT, element: <ScriptPage /> },
    ],
  },
  {
    element: <PracticeLayout />,
    children: [{ path: "/practice", element: <PracticePage /> }],
  },
]);
