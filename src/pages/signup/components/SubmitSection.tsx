import { Link } from "react-router-dom";

export default function SubmitSection() {
  return (
    <div>
      <button className="sf-submit" type="submit">
        회원 가입
      </button>

      <div className="sf-login-link">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </div>
    </div>
  );
}