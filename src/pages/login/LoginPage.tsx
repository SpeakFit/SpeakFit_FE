import "./styles/login.css";
import { useState } from "react";

import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";
import LoginOptions from "./components/LoginOptions";
import LoginButton from "./components/LoginButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogin, setKeepLogin] = useState(false);

  return (
    <div className="login-page">
      <h1 className="login-title">로그인</h1>

      <div className="login-card">
        <EmailField value={email} onChange={setEmail} />

        <PasswordField value={password} onChange={setPassword} />

        <LoginOptions
          keepLogin={keepLogin}
          onToggle={() => setKeepLogin(!keepLogin)}
        />

        <LoginButton disabled={!email || !password} />

        <p className="signup-link">
          <a href="/signup">회원가입</a>
        </p>
      </div>
    </div>
  );
}