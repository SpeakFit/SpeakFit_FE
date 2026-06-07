import "./Header.css";
import { Link, useLocation } from "react-router-dom";
import sayupaiLogo from "../../../assets/sayupai-logo-color.png";

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-header__brand" style={{ textDecoration: "none" }}>
          <div className="app-header__logo">
            <img src={sayupaiLogo} alt="SayUpAI Logo" />
          </div>
          <span className="app-header__brand--name">SayUpAI</span>
        </Link>

        <nav className="app-header__nav">
          <Link
            to="/script"
            className={`app-header__nav-link${pathname === "/script" ? " app-header__nav-link--active" : ""}`}
          >
            대본 모드
          </Link>
          <Link
            to="/practice"
            className={`app-header__nav-link${pathname === "/practice" ? " app-header__nav-link--active" : ""}`}
          >
            발표 연습
          </Link>
        </nav>
      </div>
    </header>
  );
}
