import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes.const";

import FooterLayout from "../components/FooterLayout"
import Layout from "../components/DefaultLayout";

import LandingPage from "../pages/landing/LandingPage";
import SignupPage from "../pages/signup/SignupPage";
import LoginPage from "../pages/login/LoginPage";
import PracticePage from "../pages/practice/PracticePage";


export const router = createBrowserRouter([
  {
    element: <FooterLayout />,
    children: [{ path: ROUTES.LANDING, element: <LandingPage /> }],
  },
  {
    element: <Layout />,
    children: [{ path: ROUTES.SIGNUP, element: <SignupPage /> }],
  },
  {
    element: <Layout />,
    children: [{path:ROUTES.LOGIN, element: <LoginPage />}],
  },
  {
    element: <Layout />,
    children: [{ path: "/practice", element: <PracticePage />}],
  },
]);