type GenderSelectProps = {
  value: string;
  error: string;
  onChange: (value: string) => void;
};

export default function GenderSelect({
  value,
  error,
  onChange,
}: GenderSelectProps) {
  return (
    <div className="sf-field">
      <div className="sf-label">
        성별 선택 <span className="sf-required">필수</span>
      </div>

      <select
        className={`sf-select ${error ? "sf-input--error" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      >
        <option value="" disabled>
          남성/여성
        </option>
        <option value="male">남성</option>
        <option value="female">여성</option>
        <option value="none">선택 안함</option>
      </select>

      {error && <p className="sf-error">{error}</p>}
    </div>
  );
}