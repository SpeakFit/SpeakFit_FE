type Props = {
  keepLogin: boolean;
  onToggle: () => void;
};

export default function LoginOptions({ keepLogin, onToggle }: Props) {
  return (
    <div className="login-options">
      <label>
        <input
          type="checkbox"
          checked={keepLogin}
          onChange={onToggle}
        />
        로그인 유지
      </label>

      <a href="/forgot-password">비밀번호 찾기</a>
    </div>
  );
}