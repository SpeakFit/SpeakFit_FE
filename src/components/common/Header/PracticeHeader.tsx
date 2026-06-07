import "./PracticeHeader.css";
import { useMemo } from "react";
import { clearAuthSession, getStoredUser } from "../../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import sayupaiLogo from "../../../assets/sayupai-logo-color.png";
import userIcon from "../../../assets/user-icon.svg";
import { ROUTES } from "../../../app/routes.const";


export default function PracticeHeader() {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);
  const displayName = user?.nickname?.trim() || "사용자";

  const handleLogout = () => {
    clearAuthSession();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="practice-header">
      <div className="practice-header__inner">
        
        {/* LEFT */}
        <Link to={ROUTES.LANDING} className="practice-header__left" style={{ textDecoration: 'none' }}>
          <img
            src={sayupaiLogo}
            alt="SayUpAI"
            className="practice-header__logo"
          />
          <span className="practice-header__brand">SayUpAI</span>
        </Link>

        <div className="practice-header__right">
          {user ? (
            <>
              <div className="practice-header__user">
                <img src={userIcon} alt="user" />
                <span>{displayName}</span>
              </div>

              <button
                type="button"
                className="practice-header__logout"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link className="practice-header__logout" to={ROUTES.LOGIN}>
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
