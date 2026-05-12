import Container from "../../../components/Container";
import "../styles/header.css";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../app/routes.const";
import { clearAuthSession, getStoredUser } from "../../../api/auth";
import speakfitLogo from "../../../assets/speakfit-logo.png";

export default function LandingHeader() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const displayName = user?.nickname?.trim() || "사용자";

  const handleLogout = () => {
    clearAuthSession();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="landing-header">
      <Container className="landing-header__inner">
        <div className="landing-header__brand">
          <div className="landing-header__logo">
            <img src={speakfitLogo} alt="SpeakFit Logo" />
          </div>
          <span className="landing-header__name">Speakfit</span>
        </div>

        <nav className="landing-header__nav">
          <a href="#feature">발표 연습</a>
          <a href="#feedback">피드백</a>
        </nav>

        <div className="landing-header__actions">
          {user ? (
            <>
              <span className="landing-header__user">{displayName}님</span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to={ROUTES.LOGIN}>
                로그인
              </Link>
              <Link className="btn btn-primary" to={ROUTES.SIGNUP}>
                회원가입
              </Link>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
