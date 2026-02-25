export default function EmailField() {
  return (
    <div className="sf-field">
      <div className="sf-label">
        아이디 <span className="sf-required">필수</span>
      </div>

      <div className="sf-row">
        <input
          className="sf-input"
          placeholder="아이디로 사용할 이메일 주소를 입력해주세요."
        />
        <button className="sf-action-btn" type="button">
          중복 확인
        </button>
      </div>
    </div>
  );
}
