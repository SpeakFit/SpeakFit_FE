import { useState } from "react";
import eyeIcon from "../../../assets/eye.svg";

type PasswordFieldsProps = {
  password: string;
  passwordConfirm: string;
  error: string;
  confirmError: string;
  onChangePassword: (value: string) => void;
  onChangePasswordConfirm: (value: string) => void;
};

export default function PasswordFields({
  password,
  passwordConfirm,
  error,
  confirmError,
  onChangePassword,
  onChangePasswordConfirm,
}: PasswordFieldsProps) {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  return (
    <div className="sf-field">
      <div className="sf-label">
        비밀번호 <span className="sf-required">필수</span>
      </div>

      <div className="sf-password-wrap">
        <input
          className={`sf-input ${error ? "sf-input--error" : ""}`}
          type={show1 ? "text" : "password"}
          placeholder="영문, 숫자, 특수문자가 들어간 8~20자"
          value={password}
          onChange={(e) => onChangePassword(e.target.value)}
          minLength={8}
          maxLength={20}
          required
        />
        <button
          className="sf-eye"
          type="button"
          onClick={() => setShow1((v) => !v)}
        >
          <img src={eyeIcon} alt="비밀번호 보기" />
        </button>
      </div>

      <p className={`sf-helper ${error ? "sf-helper--error" : ""}`}>
        비밀번호는 8~20자이며 영문, 숫자, 특수문자를 포함해야 합니다.
      </p>
      {error && <p className="sf-error">{error}</p>}

      <div className="sf-password-wrap">
        <input
          className={`sf-input ${confirmError ? "sf-input--error" : ""}`}
          type={show2 ? "text" : "password"}
          placeholder="비밀번호를 한번 더 입력해주세요."
          value={passwordConfirm}
          onChange={(e) => onChangePasswordConfirm(e.target.value)}
          required
        />
        <button
          className="sf-eye"
          type="button"
          onClick={() => setShow2((v) => !v)}
        >
          <img src={eyeIcon} alt="비밀번호 보기" />
        </button>
      </div>

      {confirmError && <p className="sf-error">{confirmError}</p>}
    </div>
  );
}