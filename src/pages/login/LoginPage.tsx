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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) return;

    console.log({
      email,
      password,
      keepLogin,
    });
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

        <LoginButton disabled={!email || !password} />

        <p className="signup-link">
          <a href="/signup">회원가입</a>
        </p>
      </form>
    </div>
  );
}