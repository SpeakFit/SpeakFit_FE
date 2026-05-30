import type { FeedbackMetric, FeedbackMetricId } from "../types";

type FeedbackMetricsPanelProps = {
  activeMetricId: FeedbackMetricId | null;
  goalPercent: number;
  metrics: FeedbackMetric[];
  summary: string;
  tip: string;
  onSelectMetric: (metricId: FeedbackMetricId) => void;
  /** true이면 분석 결과 도착 전 스켈레톤 상태로 렌더링 */
  isLoading?: boolean;
};

const SKELETON_METRIC_COUNT = 5;

export default function FeedbackMetricsPanel({
  activeMetricId,
  goalPercent,
  metrics,
  summary,
  tip,
  onSelectMetric,
  isLoading = false,
}: FeedbackMetricsPanelProps) {
  if (isLoading) {
    return <FeedbackMetricsPanelSkeleton />;
  }

  const safeGoalPercent = Math.min(100, Math.max(0, goalPercent));
  const circumference = Math.PI * 84;
  const strokeOffset = circumference - (safeGoalPercent / 100) * circumference;

  return (
    <aside className="feedback-metrics-panel">
      <section className="feedback-goal-card">
        <h2>목표치 일치도</h2>
        <div className="feedback-goal-card__legend">
          <span>
            <i className="feedback-goal-card__dot feedback-goal-card__dot--mint" />
            달성
          </span>
          <span>
            <i className="feedback-goal-card__dot" />
            목표치
          </span>
        </div>

        <div className="feedback-goal-card__gauge">
          <svg viewBox="0 0 220 132" aria-hidden="true">
            <path
              className="feedback-goal-card__track"
              d="M 26 106 A 84 84 0 0 1 194 106"
              pathLength={circumference}
            />
            <path
              className="feedback-goal-card__progress"
              d="M 26 106 A 84 84 0 0 1 194 106"
              pathLength={circumference}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeOffset,
              }}
            />
          </svg>
          <div>
            <span>목표치</span>
            <strong>{safeGoalPercent}%</strong>
          </div>
        </div>

        <p>
          {summary.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
      </section>

      <div className="feedback-metric-grid">
        {metrics.map((metric) => {
          const isActive = activeMetricId === metric.id;

          return (
            <button
              key={metric.id}
              type="button"
              className={`feedback-metric-card feedback-metric-card--${metric.tone} ${
                isActive ? "is-active" : ""
              }`}
              onClick={() => onSelectMetric(metric.id)}
              aria-pressed={isActive}
            >
              <span className="feedback-metric-card__top">
                <span className="feedback-metric-card__label">
                  <i>{metric.initial}</i>
                  {metric.label}
                </span>
                <span className="feedback-metric-card__chevron">⌄</span>
              </span>
              <strong>{metric.value}</strong>
              <span className="feedback-metric-card__badge">{metric.badge}</span>
              {metric.feedback && (
                <span className="feedback-metric-card__feedback" role="status">
                  {metric.feedback}
                </span>
              )}
            </button>
          );
        })}

        <div className="feedback-tip-card">
          <span className="feedback-tip-card__label">TIP</span>
          <p>{tip}</p>
        </div>
      </div>
    </aside>
  );
}

/**
 * 발표 음성 분석 결과 대기 중 표시되는 스켈레톤.
 * 실제 FeedbackMetricsPanel과 동일한 레이아웃을 유지하여
 * 곧 어떤 정보가 도착할지 사용자가 미리 짐작할 수 있게 한다.
 */
function FeedbackMetricsPanelSkeleton() {
  return (
    <aside
      className="feedback-metrics-panel feedback-metrics-panel--loading"
      role="status"
      aria-live="polite"
      aria-label="발표 음성 분석 결과를 기다리고 있어요"
    >
      <section className="feedback-goal-card">
        <h2>목표치 일치도</h2>
        <div className="feedback-goal-card__legend">
          <span>
            <i className="feedback-goal-card__dot feedback-goal-card__dot--mint" />
            달성
          </span>
          <span>
            <i className="feedback-goal-card__dot" />
            목표치
          </span>
        </div>

        <div className="feedback-goal-card__gauge">
          <svg viewBox="0 0 220 132" aria-hidden="true">
            <path
              className="feedback-goal-card__track"
              d="M 26 106 A 84 84 0 0 1 194 106"
            />
            <path
              className="feedback-goal-card__track practice-skeleton__gauge-shimmer"
              d="M 26 106 A 84 84 0 0 1 194 106"
            />
          </svg>
          <div>
            <span>목표치</span>
            <span className="practice-skeleton__bar practice-skeleton__bar--gauge-value" />
          </div>
        </div>

        <p className="practice-skeleton__summary">
          <span className="practice-skeleton__bar" style={{ width: "92%" }} />
          <span className="practice-skeleton__bar" style={{ width: "78%" }} />
          <span className="practice-skeleton__bar" style={{ width: "62%" }} />
        </p>
      </section>

      <div className="feedback-metric-grid">
        {Array.from({ length: SKELETON_METRIC_COUNT }).map((_, i) => (
          <div
            key={i}
            className="feedback-metric-card feedback-metric-card--mint practice-skeleton__metric-card"
          >
            <span className="feedback-metric-card__top">
              <span
                className="practice-skeleton__bar"
                style={{ width: 80, height: 14 }}
              />
            </span>
            <span
              className="practice-skeleton__bar"
              style={{ width: 90, height: 28, marginTop: 8 }}
            />
            <span
              className="practice-skeleton__bar"
              style={{
                width: 72,
                height: 22,
                marginTop: 10,
                borderRadius: 999,
              }}
            />
            <span
              className="practice-skeleton__bar"
              style={{ width: "80%", height: 11, marginTop: 10 }}
            />
          </div>
        ))}

        <div className="feedback-tip-card practice-skeleton__tip-card">
          <span className="feedback-tip-card__label">TIP</span>
          <span
            className="practice-skeleton__bar"
            style={{ width: "70%", height: 12, marginTop: 6 }}
          />
        </div>
      </div>
    </aside>
  );
}