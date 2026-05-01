import { useMemo, useState } from "react";
import PracticeHeader from "../../components/common/Header/PracticeHeader";
import PracticeFooter from "../../components/common/Footer/PracticeFooter";
import { getStoredUser } from "../../api/auth";
import "./styles/feedback-analysis.css";

type MetricStatus = "낮음" | "보통" | "높음" | null;
type TrendMetricKey =
  | "wpm"
  | "volume"
  | "pauses"
  | "pronunciation"
  | "emphasis";

type FeedbackSession = {
  sessionNumber: number;
  wpm: number | null;
  pitch: number | null;
  volume: number | null;
  pauses: number | null;
  pronunciation: number | null;
  emphasis: number | null;
};

type StyleMatch = {
  styleName: string | null;
  matchRate: number | null;
  headline: string | null;
  description: string | null;
};

type AverageMetric = {
  value: number | null;
  unit: string;
  status: MetricStatus;
  description: string | null;
  decimals?: number;
};

type FeedbackPageData = {
  기준라벨: string;
  sessions: FeedbackSession[];
  styleMatch: StyleMatch | null;
  averages: {
    wpm: AverageMetric;
    pitch: AverageMetric;
    pronunciation: AverageMetric;
    pauses: AverageMetric;
    volume: AverageMetric;
  };
  analysisReport: string | null;
  summaryReport: string[];
};

const STYLE_DOMAIN = {
  wpmMin: 97,
  wpmMax: 145,
  wpmMid: 121,
  pitchMin: 89.5,
  pitchMax: 240.5,
  pitchMid: 165,
};

const TREND_METRICS: Array<{
  key: TrendMetricKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  decimals?: number;
}> = [
  { key: "wpm", label: "속도", unit: "wpm", min: 110, max: 140 },
  { key: "volume", label: "성량", unit: "dB", min: 60, max: 82 },
  { key: "pauses", label: "멈춤", unit: "회/분", min: 0, max: 7 },
  { key: "pronunciation", label: "발음", unit: "ZCR", min: 0.05, max: 0.12, decimals: 2 },
  { key: "emphasis", label: "강조", unit: "점", min: 0, max: 7 },
];

const EMPTY_DATA: FeedbackPageData = {
  기준라벨: "최근 10회 기준",
  sessions: [],
  styleMatch: null,
  averages: {
    wpm: {
      value: null,
      unit: "wpm",
      status: null,
      description: null,
    },
    pitch: {
      value: null,
      unit: "Hz",
      status: null,
      description: null,
    },
    pronunciation: {
      value: null,
      unit: "ZCR",
      status: null,
      description: null,
      decimals: 2,
    },
    pauses: {
      value: null,
      unit: "회/분",
      status: null,
      description: null,
    },
    volume: {
      value: null,
      unit: "dB",
      status: null,
      description: null,
    },
  },
  analysisReport: null,
  summaryReport: [],
};

function formatValue(value: number | null, decimals = 0) {
  if (value === null || Number.isNaN(value)) return "-";
  return value.toFixed(decimals);
}

function getStatusClass(status: MetricStatus) {
  if (status === "낮음") {
    return "feedback-analysis__badge feedback-analysis__badge--low";
  }
  if (status === "높음") {
    return "feedback-analysis__badge feedback-analysis__badge--high";
  }
  if (status === "보통") {
    return "feedback-analysis__badge feedback-analysis__badge--normal";
  }
  return "feedback-analysis__badge feedback-analysis__badge--empty";
}

function toScatterX(wpm: number) {
  const { wpmMin, wpmMax } = STYLE_DOMAIN;
  return ((wpm - wpmMin) / (wpmMax - wpmMin)) * 100;
}

function toScatterY(pitch: number) {
  const { pitchMin, pitchMax } = STYLE_DOMAIN;
  return ((pitchMax - pitch) / (pitchMax - pitchMin)) * 100;
}

function ScatterPlot({ sessions }: { sessions: FeedbackSession[] }) {
  const validDots = sessions.filter(
    (item) => item.wpm !== null && item.pitch !== null
  ) as Array<FeedbackSession & { wpm: number; pitch: number }>;

  const midX =
    ((STYLE_DOMAIN.wpmMid - STYLE_DOMAIN.wpmMin) /
      (STYLE_DOMAIN.wpmMax - STYLE_DOMAIN.wpmMin)) *
    100;

  const midY =
    ((STYLE_DOMAIN.pitchMax - STYLE_DOMAIN.pitchMid) /
      (STYLE_DOMAIN.pitchMax - STYLE_DOMAIN.pitchMin)) *
    100;

  return (
    <div className="feedback-analysis__scatter-area">
      <div className="feedback-analysis__scatter">
        <div
          className="feedback-analysis__quadrant feedback-analysis__quadrant--tl"
          style={{
            left: 0,
            top: 0,
            width: `${midX}%`,
            height: `${midY}%`,
          }}
        />
        <div
          className="feedback-analysis__quadrant feedback-analysis__quadrant--tr"
          style={{
            left: `${midX}%`,
            top: 0,
            width: `${100 - midX}%`,
            height: `${midY}%`,
          }}
        />
        <div
          className="feedback-analysis__quadrant feedback-analysis__quadrant--bl"
          style={{
            left: 0,
            top: `${midY}%`,
            width: `${midX}%`,
            height: `${100 - midY}%`,
          }}
        />
        <div
          className="feedback-analysis__quadrant feedback-analysis__quadrant--br"
          style={{
            left: `${midX}%`,
            top: `${midY}%`,
            width: `${100 - midX}%`,
            height: `${100 - midY}%`,
          }}
        />

        <div
          className="feedback-analysis__scatter-axis feedback-analysis__scatter-axis--x"
          style={{ top: `${midY}%` }}
        />
        <div
          className="feedback-analysis__scatter-axis feedback-analysis__scatter-axis--y"
          style={{ left: `${midX}%` }}
        />

        <div className="feedback-analysis__scatter-label feedback-analysis__scatter-label--top-left">
          <strong>전달력 있는 스타일</strong>
          <span>(High Pitch, Slow WPM)</span>
          <em>높낮이 변화와 강조</em>
        </div>

        <div className="feedback-analysis__scatter-label feedback-analysis__scatter-label--top-right">
          <strong>열정적인 스타일</strong>
          <span>(High Pitch, Fast WPM)</span>
          <em>에너지가 넘치는 발화</em>
        </div>

        <div className="feedback-analysis__scatter-label feedback-analysis__scatter-label--bottom-left">
          <strong>신중한 스타일</strong>
          <span>(Low Pitch, Slow WPM)</span>
          <em>깊이 있는 신뢰감</em>
        </div>

        <div className="feedback-analysis__scatter-label feedback-analysis__scatter-label--bottom-right">
          <strong>지적인 스타일</strong>
          <span>(Low Pitch, Fast WPM)</span>
          <em>효율적이고 전문적인 전달</em>
        </div>

        <p className="feedback-analysis__scatter-axis-text feedback-analysis__scatter-axis-text--top">
          목소리 톤 (Pitch: High)
        </p>
        <p className="feedback-analysis__scatter-axis-text feedback-analysis__scatter-axis-text--bottom">
          Low
        </p>
        <p className="feedback-analysis__scatter-axis-text feedback-analysis__scatter-axis-text--left">
          Slow
        </p>
        <p className="feedback-analysis__scatter-axis-text feedback-analysis__scatter-axis-text--right">
          말하기 속도 (WPM: Fast)
        </p>

        {validDots.map((item) => (
          <span
            key={item.sessionNumber}
            className="feedback-analysis__scatter-dot"
            style={{
              left: `${toScatterX(item.wpm)}%`,
              top: `${toScatterY(item.pitch)}%`,
            }}
            aria-label={`${item.sessionNumber}회 발표`}
          />
        ))}

        {validDots.length === 0 && (
          <div className="feedback-analysis__empty-plot">
            발표 10회 데이터가 연결되면 산점도가 표시됩니다.
          </div>
        )}
      </div>
    </div>
  );
}

function TrendChart({
  sessions,
  activeMetric,
}: {
  sessions: FeedbackSession[];
  activeMetric: TrendMetricKey;
}) {
  const metric = TREND_METRICS.find((item) => item.key === activeMetric)!;

  const validSessions = sessions.filter(
    (item) => item[activeMetric] !== null
  ) as Array<FeedbackSession & Record<TrendMetricKey, number>>;

  const viewWidth = 660;
  const viewHeight = 340;
  const padLeft = 46;
  const padRight = 18;
  const padTop = 20;
  const padBottom = 38;
  const plotWidth = viewWidth - padLeft - padRight;
  const plotHeight = viewHeight - padTop - padBottom;

  const toX = (index: number, total: number) => {
    if (total <= 1) return padLeft + plotWidth / 2;
    return padLeft + (index / (total - 1)) * plotWidth;
  };

  const toY = (value: number) => {
    const ratio = (value - metric.min) / (metric.max - metric.min);
    return padTop + (1 - ratio) * plotHeight;
  };

  const points = validSessions
    .map((session, index) => {
      const value = session[activeMetric];
      return `${toX(index, validSessions.length)},${toY(value)}`;
    })
    .join(" ");

  const yMid = (metric.min + metric.max) / 2;
  const yLabels = [metric.max, yMid, metric.min];

  return (
    <div className="feedback-analysis__trend-chart">
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="feedback-analysis__trend-svg"
        preserveAspectRatio="none"
      >
        {yLabels.map((label, index) => {
          const y = toY(label);

          return (
            <g key={index}>
              <line
                x1={padLeft}
                y1={y}
                x2={viewWidth - padRight}
                y2={y}
                className={
                  index === 1
                    ? "feedback-analysis__grid-line--solid"
                    : "feedback-analysis__grid-line--dash"
                }
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="feedback-analysis__axis-label"
              >
                {metric.decimals ? label.toFixed(metric.decimals) : label}
              </text>
            </g>
          );
        })}

        {validSessions.map((session, index) => (
          <text
            key={session.sessionNumber}
            x={toX(index, validSessions.length)}
            y={viewHeight - 8}
            textAnchor="middle"
            className="feedback-analysis__axis-label feedback-analysis__axis-label--bottom"
          >
            {session.sessionNumber}회
          </text>
        ))}

        {validSessions.length > 1 && (
          <polyline
            fill="none"
            points={points}
            className="feedback-analysis__trend-line"
          />
        )}

        {validSessions.map((session, index) => (
          <circle
            key={session.sessionNumber}
            cx={toX(index, validSessions.length)}
            cy={toY(session[activeMetric])}
            r="5.4"
            className="feedback-analysis__trend-dot"
          />
        ))}
      </svg>

      {validSessions.length === 0 && (
        <div className="feedback-analysis__empty-plot feedback-analysis__empty-plot--trend">
          회차별 지표 데이터가 연결되면 그래프가 표시됩니다.
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  metric,
}: {
  title: string;
  metric: AverageMetric;
}) {
  return (
    <article className="feedback-analysis__metric-card">
      <p className="feedback-analysis__metric-title">{title}</p>

      <div className="feedback-analysis__metric-value-row">
        <span className="feedback-analysis__metric-value">
          {formatValue(metric.value, metric.decimals ?? 0)}
        </span>
        <span className="feedback-analysis__metric-unit">{metric.unit}</span>
      </div>

      <p className="feedback-analysis__metric-description">
        {metric.description ?? "데이터 연결 전"}
      </p>

      <span className={getStatusClass(metric.status)}>
        {metric.status ?? "미연결"}
      </span>
    </article>
  );
}

export default function FeedbackAnalysisPage() {
  const currentUser = useMemo(() => getStoredUser(), []);
  const displayName = currentUser?.nickname?.trim() || "사용자";
  const [activeMetric, setActiveMetric] = useState<TrendMetricKey>("wpm");

  /**
   * TODO:
   * 실제 API 연결 시 이 객체만 응답 매핑 결과로 교체하면 됩니다.
   */
  const feedbackData = EMPTY_DATA;

  return (
    <div className="feedback-analysis-page">
      <PracticeHeader />

      <main className="feedback-analysis-page__main">
        <section className="feedback-analysis-page__banner">
          <div className="feedback-analysis-page__banner-copy">
            <h1 className="feedback-analysis-page__title">종합 피드백</h1>
            <p className="feedback-analysis-page__subtitle">
              AI 음성 분석 모델이 수집한 2,000시간 이상의 표준 강의 데이터를 기반으로
              유저의 데이터를 분석합니다.
            </p>
          </div>

          <div className="feedback-analysis-page__range-chip">
            {feedbackData.기준라벨}
          </div>
        </section>

        <section className="feedback-analysis-page__top-layout">
          <article className="feedback-analysis-page__style-card">
            <header className="feedback-analysis-page__style-head">
              <h2 className="feedback-analysis-page__style-title">내 발표 스타일</h2>
              <div className="feedback-analysis-page__legend-row">
                <span className="feedback-analysis-page__legend-dot" />
                <span className="feedback-analysis-page__legend-label">내 발표 정보</span>
              </div>
            </header>

            <ScatterPlot sessions={feedbackData.sessions} />

            <div className="feedback-analysis-page__style-copy">
              <p>
                최근 10회 발표를 종합하면 속도와 피치, 멈춤, 성량의 흐름을 기준으로
                발표 스타일을 해석합니다.
              </p>
            </div>

            <div className="feedback-analysis-page__match-box">
              <span className="feedback-analysis-page__match-chip">
                나와 유사한 발표 스타일
              </span>

              <p className="feedback-analysis-page__match-title">
                {feedbackData.styleMatch?.styleName ?? "분석 전"} ·{" "}
                <span className="feedback-analysis-page__match-rate">
                  {feedbackData.styleMatch?.matchRate !== null &&
                  feedbackData.styleMatch?.matchRate !== undefined
                    ? `${feedbackData.styleMatch.matchRate}%`
                    : "-"}
                </span>
              </p>

              <p className="feedback-analysis-page__match-headline">
                {feedbackData.styleMatch?.headline ??
                  `${displayName}님의 발표 스타일 분석 결과가 아직 없습니다.`}
              </p>

              <p className="feedback-analysis-page__match-description">
                {feedbackData.styleMatch?.description ??
                  "발표 10회 정보가 연결되면 일치하는 발표 스타일과 설명이 표시됩니다."}
              </p>
            </div>
          </article>

          <div className="feedback-analysis-page__right-column">
            <div className="feedback-analysis-page__metric-grid feedback-analysis-page__metric-grid--top">
              <MetricCard
                title="평균 발화 속도"
                metric={feedbackData.averages.wpm}
              />
              <MetricCard
                title="평균 피치"
                metric={feedbackData.averages.pitch}
              />
              <MetricCard
                title="평균 발음 정확도"
                metric={feedbackData.averages.pronunciation}
              />
            </div>

            <div className="feedback-analysis-page__metric-grid feedback-analysis-page__metric-grid--bottom">
              <MetricCard
                title="평균 멈춤 횟수"
                metric={feedbackData.averages.pauses}
              />
              <MetricCard
                title="평균 성량"
                metric={feedbackData.averages.volume}
              />
            </div>

            <article className="feedback-analysis-page__trend-card">
              <div className="feedback-analysis-page__trend-head">
                <h2 className="feedback-analysis-page__section-title">
                  발표별 변화 추이
                </h2>

                <div className="feedback-analysis-page__metric-tabs">
                  {TREND_METRICS.map((metric) => (
                    <button
                      key={metric.key}
                      type="button"
                      className={
                        activeMetric === metric.key
                          ? "feedback-analysis__tab feedback-analysis__tab--active"
                          : "feedback-analysis__tab"
                      }
                      onClick={() => setActiveMetric(metric.key)}
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>
              </div>

              <TrendChart
                sessions={feedbackData.sessions}
                activeMetric={activeMetric}
              />
            </article>
          </div>
        </section>

        <section className="feedback-analysis-page__report-card">
          <h2 className="feedback-analysis-page__section-title">
            📝 AI 분석 리포트
          </h2>

          <div className="feedback-analysis-page__report-content">
            {feedbackData.analysisReport ? (
              <pre className="feedback-analysis-page__report-pre">
                {feedbackData.analysisReport}
              </pre>
            ) : (
              <p className="feedback-analysis-page__empty-text">
                AI 분석 리포트가 아직 없습니다.
              </p>
            )}
          </div>
        </section>

        <section className="feedback-analysis-page__summary-card">
          <h2 className="feedback-analysis-page__section-title">
            📍 AI 요약 리포트
          </h2>

          {feedbackData.summaryReport.length > 0 ? (
            <ol className="feedback-analysis-page__summary-list">
              {feedbackData.summaryReport.map((item, index) => (
                <li key={index} className="feedback-analysis-page__summary-item">
                  <span className="feedback-analysis-page__summary-index">
                    {index + 1}
                  </span>
                  <span className="feedback-analysis-page__summary-text">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="feedback-analysis-page__empty-text">
              AI 요약 리포트가 아직 없습니다.
            </p>
          )}
        </section>
      </main>

      <PracticeFooter />
    </div>
  );
}
