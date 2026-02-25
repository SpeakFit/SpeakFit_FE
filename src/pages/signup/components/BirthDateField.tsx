export default function BirthDateField() {
  return (
    <div className="sf-field">
      <div className="sf-label">
        생년월일 <span className="sf-required">필수</span>
      </div>

      <div className="sf-birth-row">
        <input className="sf-input" placeholder="YYYY" />
        <input className="sf-input" placeholder="MM" />
        <input className="sf-input" placeholder="DD" />
      </div>
    </div>
  );
}
