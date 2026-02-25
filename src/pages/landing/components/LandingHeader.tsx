import Container from "../../../components/Container";
import "../styles/header.css";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../app/routes.const";
import speakfitLogo from "../../../assets/speakfit-logo.png";

export default function LandingHeader() {
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
          <a href="#pricing">요금</a>
        </nav>

        <div className="landing-header__actions">
          <Link className="btn btn-ghost" to={ROUTES.LOGIN}>
            로그인
          </Link>
          <Link className="btn btn-primary" to="/signup">
            회원가입
          </Link>
        </div>
      </Container>
    </header>
  );
}
