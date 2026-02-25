import "./Header.css";
import speakfitLogo from "../../../assets/speakfit-logo-color.png"

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <div className="app-header__logo">
            <img src={speakfitLogo} alt="SpeakFit Logo" />
          </div>
          <span className="app-header__brand">SpeakFit</span>
        </div>
      </div>
    </header>
  );
}