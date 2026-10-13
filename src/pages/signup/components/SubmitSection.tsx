import { Link } from "react-router-dom";

type SubmitSectionProps = {
  disabled?: boolean;
  /** 필수 입력값과 필수 약관 동의가 모두 채워졌는지 여부 */
  isReady?: boolean;
};

export default function SubmitSection({
  disabled = false,
  isReady = false,
}: SubmitSectionProps) {
  return (
    <div>
      <button
        className={`sf-submit ${isReady ? "is-ready" : ""}`}
        type="submit"
        disabled={disabled}
      >
        {disabled ? "가입 중..." : "회원 가입"}
      </button>

      <div className="sf-login-link">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </div>
    </div>
  );
}
