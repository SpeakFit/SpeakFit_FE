type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function EmailField({ value, onChange }: Props) {
  return (
    <fieldset className="login-fieldset">
      <legend className="login-legend">Email</legend>
      <input
        className="login-input"
        type="email"
        placeholder="이메일 주소"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </fieldset>
  );
}