import "./styles/login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveAuthSession } from "../../api/auth";
import { ROUTES } from "../../app/routes.const";

import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";
import LoginOptions from "./components/LoginOptions";
import LoginButton from "./components/LoginButton";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogin, setKeepLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) return;

    try {
      setIsSubmitting(true);
      const auth = await login({ email, password });
      saveAuthSession(auth, keepLogin);

      navigate(ROUTES.LANDING, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "로그인에 실패했습니다.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <h1 className="login-title">로그인</h1>

      <form className="login-card" onSubmit={handleSubmit}>
        <EmailField value={email} onChange={setEmail} />

        <PasswordField value={password} onChange={setPassword} />

        <LoginOptions
          keepLogin={keepLogin}
          onToggle={() => setKeepLogin((prev) => !prev)}
        />

        <LoginButton
          disabled={!email || !password || isSubmitting}
          isSubmitting={isSubmitting}
        />

        <p className="signup-link">
          <Link to={ROUTES.SIGNUP}>회원가입</Link>
        </p>
      </form>
    </div>
  );
}
