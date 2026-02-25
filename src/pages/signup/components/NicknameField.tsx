import "../styles/signup.css";

export default function NicknameField() {
  return (
    <div className="sf-field">
      <div className="sf-label">
        닉네임 <span className="sf-required">필수</span>
      </div>
      <input
        className="sf-input"
        placeholder="사용하실 닉네임을 입력해주세요."
      />
    </div>
  );
}
