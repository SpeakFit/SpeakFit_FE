import "./PracticeHeader.css";
import { useNavigate, Link } from "react-router-dom";
import { clearAuthSession, getStoredUser } from "../../../api/authStorage";
import speakfitLogo from "../../../assets/speakfit-logo-color.png";
import userIcon from "../../../assets/user-icon.svg";
import { ROUTES } from "../../../app/routes.const";

export default function PracticeHeader() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const nickname = user?.nickname?.trim() || "사용자";

  const handleLogout = () => {
    clearAuthSession();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="practice-header">
      <div className="practice-header__inner">
        
        {/* LEFT */}
        <Link to="/" className="practice-header__left" style={{ textDecoration: 'none' }}>
          <img
            src={speakfitLogo}
            alt="Speakfit"
            className="practice-header__logo"
          />
          <span className="practice-header__brand">Speakfit</span>
        </Link>

        {/* RIGHT */}
        <div className="practice-header__right">
          <div className="practice-header__user">
            <img src={userIcon} alt="user" />
            <span>{nickname}</span>
          </div>

          <button
            type="button"
            className="practice-header__logout"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>

      </div>
    </header>
  );
}
