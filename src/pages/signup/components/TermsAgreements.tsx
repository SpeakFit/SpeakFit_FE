export default function TermsAgreements() {
  return (
    <div className="sf-terms">
      <label className="sf-term-item">
        <input className="sf-checkbox" type="checkbox" />
        서비스 이용 약관 동의(필수)
      </label>

      <label className="sf-term-item">
        <input className="sf-checkbox" type="checkbox" />
        개인정보 수집 및 이용 동의(필수)
      </label>
    </div>
  );
}
