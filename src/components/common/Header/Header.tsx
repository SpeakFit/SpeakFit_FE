import "./Header.css";
import { Link } from "react-router-dom";
import speakfitLogo from "../../../assets/speakfit-logo-color.png"

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-header__brand" style={{ textDecoration: 'none' }}>
          <div className="app-header__logo">
            <img src={speakfitLogo} alt="SpeakFit Logo" />
          </div>
          <span className="app-header__brand--name">SpeakFit</span>
        </Link>
      </div>
    </header>
  );
}