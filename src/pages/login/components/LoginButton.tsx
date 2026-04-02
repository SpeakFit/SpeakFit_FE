type Props = {
  disabled: boolean;
};

export default function LoginButton({ disabled }: Props) {
  return (
    <button className="login-button" disabled={disabled}>
      로그인
    </button>
  );
}