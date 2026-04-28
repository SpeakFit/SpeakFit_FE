import Container from "../../../components/Container";
import "./Footer.css";
import { Link } from "react-router-dom";
import speakfitLogo from "../../../assets/speakfit-logo.png";

export default function FooterSection() {
  return (
    <footer className="landing-footer">
      <Container className="landing-footer__container">
        <div className="landing-footer__inner">
          <div className="landing-footer__left">
            <div className="landing-footer__brand">
              <div className="landing__logo">
                <img src={speakfitLogo} alt="SpeakFit Logo" />
              </div>
              <span className="landing-footer__name">SpeakFit</span>
            </div>

            <nav className="landing-footer__links">
              <Link to="/terms" className="landing-footer__link">
                이용약관
              </Link>
              <Link to="/privacy" className="landing-footer__link">
                개인정보처리방침
              </Link>
              <Link to="/license" className="landing-footer__link">
                라이선스
              </Link>
            </nav>
          </div>
          <div className="landing-footer__meta">
            <a
              className="landing-footer__email"
              href="mailto:speakfit0123@gmail.com"
            >
              문의: speakfit0123@gmail.com
            </a>
            <p className="landing-footer__copyright">
              © 2024 SpeakFit. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
