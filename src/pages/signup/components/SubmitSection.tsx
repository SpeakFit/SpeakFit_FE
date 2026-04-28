import { Link } from "react-router-dom";

type SubmitSectionProps = {
  disabled?: boolean;
};

export default function SubmitSection({ disabled = false }: SubmitSectionProps) {
  return (
    <div>
      <button className="sf-submit" type="submit" disabled={disabled}>
        {disabled ? "가입 중..." : "회원 가입"}
      </button>

      <div className="sf-login-link">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </div>
    </div>
  );
}
