import { useState } from "react";
import eyeIcon from "../../../assets/eye.svg";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function PasswordField({ value, onChange }: Props) {
  const [show, setShow] = useState(false);

  return (
    <fieldset className="login-fieldset">
      <legend className="login-legend">Password</legend>

      <div className="password-wrapper">
        <input
          className="login-input login-input--password"
          type={show ? "text" : "password"}
          placeholder="비밀번호"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        <button
          className="sf-eye"
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
          aria-pressed={show}
        >
          <img src={eyeIcon} alt="" />
        </button>
      </div>
    </fieldset>
  );
}