import Container from "../../../components/Container";
import "../styles/hero.css";
import heroImage from "../../../assets/hero-image.png";

export default function HeroSection() {
  return (
    <section className="hero">
      <Container>
        <div className="hero__content">
          <h1 className="hero__title">
            어떤 무대에서도 당당하게, SpeakFit과 함께
          </h1>
          <p className="hero__description">
            AI 기반 발표 분석으로 당신의 발표를 객관적으로 진단하고, 더 나은
            발표를 위한 개선점을 제공합니다.
          </p>
          <div className="hero__actions">
            <button className="btn btn-primary">지금 분석하기</button>
            <button className="btn btn-ghost">분석 결과 알아보기</button>
          </div>
        </div>
        <div className="hero__image">
          <img src={heroImage} alt="SpeakFit 발표 분석 서비스" />
        </div>
      </Container>
    </section>
  );
}
