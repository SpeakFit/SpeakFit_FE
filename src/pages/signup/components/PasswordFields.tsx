import { useState } from "react";
import eyeIcon from "../../../assets/eye.svg";

export default function PasswordFields() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  return (
    <div className="sf-field">
      <div className="sf-label">
        비밀번호 <span className="sf-required">필수</span>
      </div>

      <div className="sf-password-wrap">
        <input
          className="sf-input"
          type={show1 ? "text" : "password"}
          placeholder="영문, 숫자, 특수문자가 들어간 8~20자"
        />
        <button
          className="sf-eye"
          type="button"
          onClick={() => setShow1((v) => !v)}
        >
          <img src={eyeIcon} alt="비밀번호 보기" />
        </button>
      </div>

      <div className="sf-password-wrap">
        <input
          className="sf-input"
          type={show2 ? "text" : "password"}
          placeholder="비밀번호를 한번 더 입력해주세요."
        />
        <button
          className="sf-eye"
          type="button"
          onClick={() => setShow2((v) => !v)}
        >
          <img src={eyeIcon} alt="비밀번호 보기" />
        </button>
      </div>
    </div>
  );
}
