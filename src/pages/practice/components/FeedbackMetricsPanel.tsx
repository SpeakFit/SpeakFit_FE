import type { FeedbackMetricId } from "../types";

type FeedbackMetric = {
  id: FeedbackMetricId;
  label: string;
  value: string;
  badge: string;
  initial: string;
  tone: "slate" | "amber" | "violet" | "green";
};

type FeedbackMetricsPanelProps = {
  activeMetricId: FeedbackMetricId | null;
  onSelectMetric: (metricId: FeedbackMetricId) => void;
};

const feedbackMetrics: FeedbackMetric[] = [
  {
    id: "speech-rate",
    label: "발화 속도",
    value: "조금 느림",
    badge: "90wpm",
    initial: "S",
    tone: "slate",
  },
  {
    id: "voice-energy",
    label: "음성 에너지",
    value: "낮음",
    badge: "에너지 부족",
    initial: "E",
    tone: "amber",
  },
  {
    id: "pause",
    label: "멈춤 구간",
    value: "주의",
    badge: "2초+ 멈춤",
    initial: "P",
    tone: "amber",
  },
  {
    id: "emphasis",
    label: "강조 표현",
    value: "낮음",
    badge: "강조 부족",
    initial: "M",
    tone: "violet",
  },
  {
    id: "clarity",
    label: "발음 명료도",
    value: "불명확",
    badge: "ZCR 0.08",
    initial: "M",
    tone: "green",
  },
];

export default function FeedbackMetricsPanel({
  activeMetricId,
  onSelectMetric,
}: FeedbackMetricsPanelProps) {
  const goalPercent = 67;
  const circumference = Math.PI * 84;
  const strokeOffset = circumference - (goalPercent / 100) * circumference;

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
            <strong>{goalPercent}%</strong>
          </div>
        </div>

        <p>
          전반적으로 안정적인 발화였지만,
          <br />
          강조 표현과 발음 명료도가 부족해 전달력이
          <br />
          다소 약하게 느껴졌습니다.
        </p>
      </section>

      <div className="feedback-metric-grid">
        {feedbackMetrics.map((metric) => {
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
            </button>
          );
        })}

        <div className="feedback-tip-card">
          <span className="feedback-tip-card__label">TIP</span>
          <p>
            핵심 키워드를 더 강조하고 문장 끝에서 짧게 멈추면 전달력이
            좋아집니다.
          </p>
        </div>
      </div>
    </aside>
  );
}
