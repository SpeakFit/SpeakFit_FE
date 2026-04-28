import "../styles/signup.css";

type NicknameFieldProps = {
  value: string;
  error: string;
  onChange: (value: string) => void;
};

export default function NicknameField({
  value,
  error,
  onChange,
}: NicknameFieldProps) {
  return (
    <div className="sf-field">
      <div className="sf-label">
        닉네임 <span className="sf-required">필수</span>
      </div>

      <input
        className={`sf-input ${error ? "sf-input--error" : ""}`}
        value={value}
        onChange={(e) => {
          const value = e.target.value;
          const filtered = value.replace(/[^a-zA-Z0-9가-힣]/g, "");
          onChange(filtered)
        }}
        placeholder="사용하실 닉네임을 입력해주세요."
        minLength={2}
        maxLength={10}
        required
      />

      {error && <p className="sf-error">{error}</p>}
    </div>
  );
}