type BirthDateFieldProps = {
  value: string;
  error: string;
  onChange: (value: string) => void;
};

export default function BirthDateField({
  value,
  error,
  onChange,
}: BirthDateFieldProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="sf-field">
      <div className="sf-label">
        생년월일 <span className="sf-required">필수</span>
      </div>

      <input
        className={`sf-input ${error ? "sf-input--error" : ""}`}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        max={today}
        required
      />

      {error && <p className="sf-error">{error}</p>}
    </div>
  );
}