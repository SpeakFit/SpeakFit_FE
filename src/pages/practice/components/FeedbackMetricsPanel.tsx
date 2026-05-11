import type { FeedbackMetric, FeedbackMetricId } from "../types";

type FeedbackMetricsPanelProps = {
  activeMetricId: FeedbackMetricId | null;
  goalPercent: number;
  metrics: FeedbackMetric[];
  summary: string;
  tip: string;
  onSelectMetric: (metricId: FeedbackMetricId) => void;
};

export default function FeedbackMetricsPanel({
  activeMetricId,
  goalPercent,
  metrics,
  summary,
  tip,
  onSelectMetric,
}: FeedbackMetricsPanelProps) {
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
