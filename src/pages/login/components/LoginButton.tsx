type Props = {
  disabled: boolean;
  isSubmitting?: boolean;
};

export default function LoginButton({ disabled, isSubmitting = false }: Props) {
  return (
    <button type="submit" className="login-button" disabled={disabled}>
      {isSubmitting ? "로그인 중..." : "로그인"}
    </button>
  );
}
