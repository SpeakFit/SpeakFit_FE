/**
 * 피드백 페이지 로딩 중 표시되는 스켈레톤.
 * 실제 페이지 레이아웃과 동일한 구조로 깜빡이는 회색 박스를 보여준다.
 */
export default function FeedbackSkeleton() {
  return (
    <div className="feedback-skeleton" aria-label="피드백을 불러오는 중">
      {/* 상단 배너 영역 */}
      <div className="feedback-skeleton__banner">
        <div className="feedback-skeleton__line feedback-skeleton__line--title" />
        <div className="feedback-skeleton__line feedback-skeleton__line--subtitle" />
        <div className="feedback-skeleton__chip" />
      </div>

      {/* 본문 2단 레이아웃 */}
      <div className="feedback-skeleton__top">
        {/* 좌측: 스타일 카드 */}
        <div className="feedback-skeleton__style-card">
          <div className="feedback-skeleton__line feedback-skeleton__line--heading" />
          <div className="feedback-skeleton__matrix" />
          <div className="feedback-skeleton__line feedback-skeleton__line--short" />
          <div className="feedback-skeleton__line feedback-skeleton__line--full" />
          <div className="feedback-skeleton__line feedback-skeleton__line--medium" />
        </div>

        {/* 우측: 메트릭 카드 5장 + 차트 */}
        <div className="feedback-skeleton__right">
          <div className="feedback-skeleton__metric-grid">
            <div className="feedback-skeleton__metric-card" />
            <div className="feedback-skeleton__metric-card" />
            <div className="feedback-skeleton__metric-card" />
            <div className="feedback-skeleton__metric-card" />
            <div className="feedback-skeleton__metric-card" />
          </div>

          <div className="feedback-skeleton__chart-card">
            <div className="feedback-skeleton__line feedback-skeleton__line--heading" />
            <div className="feedback-skeleton__chart" />
          </div>
        </div>
      </div>

      {/* AI 분석 리포트 영역 */}
      <div className="feedback-skeleton__report-card">
        <div className="feedback-skeleton__line feedback-skeleton__line--heading" />
        <div className="feedback-skeleton__line feedback-skeleton__line--full" />
        <div className="feedback-skeleton__line feedback-skeleton__line--full" />
        <div className="feedback-skeleton__line feedback-skeleton__line--medium" />
      </div>

      {/* AI 요약 리포트 영역 */}
      <div className="feedback-skeleton__summary-card">
        <div className="feedback-skeleton__line feedback-skeleton__line--heading" />
        <div className="feedback-skeleton__line feedback-skeleton__line--full" />
        <div className="feedback-skeleton__line feedback-skeleton__line--full" />
        <div className="feedback-skeleton__line feedback-skeleton__line--medium" />
      </div>
    </div>
  );
}