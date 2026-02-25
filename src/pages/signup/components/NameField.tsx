export default function NameField() {
  return (
    <div className="sf-field">
      <div className="sf-label">
        이름 <span className="sf-required">필수</span>
      </div>
      <input className="sf-input" placeholder="이름을 입력해주세요." />
    </div>
  );
}