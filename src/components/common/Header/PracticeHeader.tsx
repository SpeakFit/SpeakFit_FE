import "./PracticeHeader.css";
import speakfitLogo from "../../../assets/speakfit-logo-color.png";
import userIcon from "../../../assets/user-icon.svg";

export default function PracticeHeader() {
  return (
    <header className="practice-header">
      <div className="practice-header__inner">
        
        {/* LEFT */}
        <div className="practice-header__left">
          <img
            src={speakfitLogo}
            alt="Speakfit"
            className="practice-header__logo"
          />
          <span className="practice-header__brand">Speakfit</span>
        </div>

        {/* RIGHT */}
        <div className="practice-header__right">
          <div className="practice-header__user">
            <img src={userIcon} alt="user" />
            <span>사용자</span>
          </div>

          <button className="practice-header__logout">
            로그아웃
          </button>
        </div>

      </div>
    </header>
  );
}