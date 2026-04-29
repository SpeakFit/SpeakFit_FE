import { createBrowserRouter } from "react-router-dom";
import FooterLayout from "../components/FooterLayout";
import Layout from "../components/DefaultLayout";
import PracticeLayout from "../components/PracticeLayout";
import LandingPage from "../pages/landing/LandingPage";
import LoginPage from "../pages/login/LoginPage";
import SignupPage from "../pages/signup/SignupPage";
import ScriptPage from "../pages/script/ScriptPage";
import PracticePage from "../pages/practice/PracticePage";
import VoiceRecordingPage from "../pages/voice-recording/VoiceRecordingPage";
import { ROUTES } from "./routes.const";

export const router = createBrowserRouter([
  {
    element: <FooterLayout />,
    children: [{ path: ROUTES.LANDING, element: <LandingPage /> }],
  },
  {
    element: <Layout />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.SIGNUP, element: <SignupPage /> },
      { path: ROUTES.SCRIPT, element: <ScriptPage /> },
    ],
  },
  {
    path: ROUTES.VOICE_RECORDING,
    element: <VoiceRecordingPage />,
  },
  {
    element: <PracticeLayout />,
    children: [{ path: ROUTES.PRACTICE, element: <PracticePage /> }],
  },
]);
