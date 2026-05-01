import "./PracticeHeader.css";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import speakfitLogo from "../../../assets/speakfit-logo-color.png";
import userIcon from "../../../assets/user-icon.svg";
import { ROUTES } from "../../../app/routes.const";
import { clearAuthSession, getStoredUser } from "../../../api/auth";

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
        <div className="practice-header__left">
          <img
            src={speakfitLogo}
            alt="Speakfit"
            className="practice-header__logo"
          />
          <span className="practice-header__brand">Speakfit</span>
        </div>

        <div className="practice-header__right">
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
        </div>
      </div>
    </header>
  );
}
