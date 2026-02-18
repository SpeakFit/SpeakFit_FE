import Container from "../../../components/Container";
import "../styles/footer.css";
import speakfitLogo from "../speakfit-logo.png";

export default function FooterSection() {
  return (
    <footer className="landing-footer">
      <Container className="landing-footer__container">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing__logo">
              <img src={speakfitLogo} alt="SpeakFit Logo" />
            </div>
            <span className="landing-footer__name">SpeakFit</span>
          </div>

          <nav className="landing-footer__links">
            <a href="/terms" className="landing-footer__link">이용약관</a>
            <a href="/privacy" className="landing-footer__link">개인정보처리방침</a>
            <a href="/license" className="landing-footer__link">라이선스</a>
          </nav>

          <div className="landing-footer__meta">
            <a className="landing-footer__email" href="mailto:dlsgh4090@gmail.com">
              문의: dlsgh4090@gmail.com
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