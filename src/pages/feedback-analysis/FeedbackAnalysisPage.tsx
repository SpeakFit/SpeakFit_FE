import { useEffect, useMemo, useState } from "react";
import PracticeHeader from "../../components/common/Header/PracticeHeader";
import PracticeFooter from "../../components/common/Footer/PracticeFooter";
import { getStoredUser } from "../../api/auth";
import {
  createFeedback,
  getFeedbackDetail,
  type FeedbackDetailCompleted,
} from "../../api/feedback";
import {
  mapFeedbackResponse,
  type FeedbackTrendComparison,
} from "./mapFeedbackResponse";
import "./styles/feedback-analysis.css";

type MetricStatus = "낮음" | "보통" | "높음" | null;

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
  styleMatch: StyleMatch | null;
  averages: {
    wpm: AverageMetric;
    pitch: AverageMetric;
    pronunciation: AverageMetric;
    pauses: AverageMetric;
    volume: AverageMetric;
  };
  trendComparisons: FeedbackTrendComparison[];
  analysisReport: string | null;
  summaryReport: string[];
};

const EMPTY_DATA: FeedbackPageData = {
  기준라벨: "최근 7일 기준",
  styleMatch: null,
  averages: {
    wpm: { value: null, unit: "wpm", status: null, description: null },
    pitch: { value: null, unit: "Hz", status: null, description: null },
    pronunciation: {
      value: null,
      unit: "%",
      status: null,
      description: null,
      decimals: 0,
    },
    pauses: { value: null, unit: "회", status: null, description: null },
    volume: { value: null, unit: "dB", status: null, description: null },
  },
  trendComparisons: [],
  analysisReport: null,
  summaryReport: [],
};

function formatValue(value: number | null, decimals = 0) {
  if (value === null || Number.isNaN(value)) return "-";
  return value.toFixed(decimals);
}

function getStatusClass(status: MetricStatus) {
  if (status === "낮음") return "feedback-analysis__badge feedback-analysis__badge--low";
  if (status === "높음") return "feedback-analysis__badge feedback-analysis__badge--high";
  if (status === "보통") return "feedback-analysis__badge feedback-analysis__badge--normal";
  return "feedback-analysis__badge feedback-analysis__badge--empty";
}

function getDiffClass(diff: string | null) {
  if (!diff) return "feedback-trend__diff feedback-trend__diff--neutral";
  if (diff.includes("+")) return "feedback-trend__diff feedback-trend__diff--up";
  if (diff.includes("-")) return "feedback-trend__diff feedback-trend__diff--down";
  return "feedback-trend__diff feedback-trend__diff--neutral";
}

function getDiffArrow(diff: string | null) {
  if (!diff) return "";
  if (diff.includes("+")) return "▲";
  if (diff.includes("-")) return "▼";
  return "";
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

function TrendCompareList({ items }: { items: FeedbackTrendComparison[] }) {
  if (items.length === 0) {
    return (
      <div className="feedback-trend__empty">
        지난 발표 데이터가 연결되면 변화 추이가 표시됩니다.
      </div>
    );
  }

  return (
    <ul className="feedback-trend__list">
      {items.map((item) => (
        <li key={item.label} className="feedback-trend__row">
          <p className="feedback-trend__label">{item.label}</p>

          <div className="feedback-trend__compare">
            <span className="feedback-trend__previous">
              {item.previous ?? "-"}
              <em className="feedback-trend__previous-unit">{item.unit}</em>
            </span>

            <span className="feedback-trend__arrow" aria-hidden>
              →
            </span>

            <span className="feedback-trend__current">
              {item.current ?? "-"}
              <em className="feedback-trend__current-unit">{item.unit}</em>
            </span>
          </div>

          <span className={getDiffClass(item.diff)}>
            {getDiffArrow(item.diff)} {item.diff ?? "-"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function FeedbackAnalysisPage() {
  const currentUser = useMemo(() => getStoredUser(), []);
  const displayName = currentUser?.nickname?.trim() || "사용자";

  const [feedbackData, setFeedbackData] =
    useState<FeedbackPageData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const load = async () => {
      try {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        const created = await createFeedback({
          startDate: formatDate(sevenDaysAgo),
          endDate: formatDate(today),
        });

        const detail = await getFeedbackDetail(created.feedbackId);

        if (!isMounted) return;

        if (detail.status === "COMPLETED") {
          setFeedbackData(
            mapFeedbackResponse(detail as FeedbackDetailCompleted)
          );
        } else {
          setStatusMessage(
            "AI가 최근 연습 기록을 분석 중이에요. 잠시 후 다시 시도해주세요."
          );
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "피드백을 불러오지 못했습니다."
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="feedback-analysis-page">
      <PracticeHeader />

      <main className="feedback-analysis-page__main">
        {isLoading && (
          <p className="feedback-analysis-page__notice feedback-analysis-page__notice--info">
            피드백 결과를 불러오는 중이에요...
          </p>
        )}

        {statusMessage && (
          <p className="feedback-analysis-page__notice feedback-analysis-page__notice--info">
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p className="feedback-analysis-page__notice feedback-analysis-page__notice--error">
            {errorMessage}
          </p>
        )}

        <section className="feedback-analysis-page__banner">
          <div className="feedback-analysis-page__banner-copy">
            <h1 className="feedback-analysis-page__title">종합 피드백</h1>
            <p className="feedback-analysis-page__subtitle">
              AI 음성 분석 모델이 수집한 2,000시간 이상의 표준 강의 데이터를
              기반으로 유저의 데이터를 분석합니다.
            </p>
          </div>

          <div className="feedback-analysis-page__range-chip">
            {feedbackData.기준라벨}
          </div>
        </section>

        <section className="feedback-analysis-page__top-layout">
          <article className="feedback-analysis-page__style-card">
            <header className="feedback-analysis-page__style-head">
              <h2 className="feedback-analysis-page__style-title">
                내 발표 스타일
              </h2>
            </header>

            <div className="feedback-style__match-block">
              <div className="feedback-style__chip">
                나와 유사한 발표 스타일
              </div>

              <p className="feedback-style__name">
                {feedbackData.styleMatch?.styleName ?? "분석 전"}
              </p>

              <div className="feedback-style__rate-row">
                <div className="feedback-style__rate-bar">
                  <div
                    className="feedback-style__rate-bar-fill"
                    style={{
                      width: `${feedbackData.styleMatch?.matchRate ?? 0}%`,
                    }}
                  />
                </div>
                <span className="feedback-style__rate-text">
                  {feedbackData.styleMatch?.matchRate !== null &&
                  feedbackData.styleMatch?.matchRate !== undefined
                    ? `${feedbackData.styleMatch.matchRate}%`
                    : "-"}
                </span>
              </div>

              <p className="feedback-style__description">
                {feedbackData.styleMatch?.headline ??
                  `${displayName}님의 발표 스타일 분석 결과가 아직 없습니다.`}
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
                <span className="feedback-analysis-page__trend-sub">
                  지난주 대비 내 변화
                </span>
              </div>

              <TrendCompareList items={feedbackData.trendComparisons} />
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
                <li
                  key={index}
                  className="feedback-analysis-page__summary-item"
                >
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
