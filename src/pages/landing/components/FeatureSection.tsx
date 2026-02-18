import Container from "../../../components/Container";
import FeatureRow from "./FeatureRow";
import "../styles/feature.css";

import featureImage1 from "../feature-image1.png";
import featureImage2 from "../feature-image2.png";

export default function FeatureSection() {
  return (
    <section className="feature" id="feature">
      <Container>
        <FeatureRow
          variant="row1"
          title="실시간 발표 연습"
          description="AI가 당신의 발표를 실시간으로 분석하고, 발음, 속도, 톤 등 다양한 요소를 평가합니다. 언제든지 연습하고 즉시 피드백을 받아보세요."
          buttonText="연습 시작하기"
          imageSrc={featureImage1}
          imageAlt="실시간 발표 연습 화면"
        />

        <FeatureRow
          variant="row2"
          title="상세한 분석 리포트"
          description="발표 후 상세한 분석 리포트를 제공합니다. 강점과 개선점을 명확히 파악하고, 다음 발표를 위한 구체적인 액션 플랜을 수립하세요."
          buttonText="분석 리포트 보기"
          imageSrc={featureImage2}
          imageAlt="분석 리포트 화면"
          reverse
        />
      </Container>
    </section>
  );
}
