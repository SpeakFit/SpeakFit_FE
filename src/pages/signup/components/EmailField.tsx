type EmailFieldProps = {
  value: string;
  error: string;
  onChange: (value: string) => void;
};

export default function EmailField({
  value,
  error,
  onChange,
}: EmailFieldProps) {
  return (
    <div className="sf-field">
      <label className="sf-label">이메일<span className="sf-required">필수</span></label>
      <input
        className={`sf-input ${error ? "sf-input--error" : ""}`}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="이메일을 입력하세요"
      />
      {error && <p className="sf-error">{error}</p>}
    </div>
  );
}