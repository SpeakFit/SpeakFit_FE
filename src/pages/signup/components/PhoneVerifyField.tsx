export default function PhoneVerifyField() {
  return (
    <div className="sf-field">
      <div className="sf-label">
        전화번호 <span className="sf-required">필수</span>
      </div>

      <div className="sf-row">
        <input className="sf-input" placeholder="전화번호를 입력해 주세요." />
        <button className="sf-action-btn" type="button">
          전화번호 인증
        </button>
      </div>
    </div>
  );
}
