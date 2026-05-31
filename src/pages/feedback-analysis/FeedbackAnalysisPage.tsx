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
  type FeedbackTrendSeries,
  type FeedbackAnalysisSection,
} from "./mapFeedbackResponse";
import FeedbackSkeleton from "./components/FeedbackSkeleton";
import FeedbackTrendChart from "./components/FeedbackTrendChart";
import FeedbackStyleMatrix from "./components/FeedbackStyleMatrix";
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
  trendSeries: FeedbackTrendSeries[];
  analysisSections: FeedbackAnalysisSection[];
  summaryReport: string[];
};

const EMPTY_DATA: FeedbackPageData = {
  기준라벨: "최근 10회 기준",
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
  trendSeries: [],
  analysisSections: [],
  summaryReport: [],
};

function formatValue(value: number | null, decimals = 0) {
  if (value === null || Number.isNaN(value)) return "-";
  return value.toFixed(decimals);
}

/**
 * axios 에러나 일반 에러를 사용자 친화적인 한국어 메시지로 변환한다.
 * "Request failed with status code 403" 같은 기술 메시지가 그대로 노출되지 않도록 함.
 */
function toFriendlyErrorMessage(error: unknown): string {
  // axios 에러는 response.status를 가짐
  const status = (error as { response?: { status?: number } })?.response?.status;

  if (status === 401) {
    return "로그인이 필요해요. 다시 로그인해 주세요.";
  }
  if (status === 403) {
    return "이 피드백을 볼 권한이 없어요. 다시 로그인하거나 관리자에게 문의해 주세요.";
  }
  if (status === 404) {
    return "분석된 발표 기록이 아직 없어요. 발표 연습을 먼저 진행해 주세요.";
  }
  if (status === 500 || status === 502 || status === 503) {
    return "서버에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.";
  }

  // 기타 - 기술적인 원본 메시지를 그대로 노출하지 않고 일반 안내로 통일
  if (error instanceof Error) {
    return "피드백을 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
  }
  return "피드백을 불러오지 못했어요.";
}

function getStatusClass(status: MetricStatus) {
  if (status === "낮음") return "feedback-analysis__badge feedback-analysis__badge--low";
  if (status === "높음") return "feedback-analysis__badge feedback-analysis__badge--high";
  if (status === "보통") return "feedback-analysis__badge feedback-analysis__badge--normal";
  return "feedback-analysis__badge feedback-analysis__badge--empty";
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

  const [feedbackData, setFeedbackData] =
    useState<FeedbackPageData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    // 분석 진행 중일 때 재조회 간격(ms)과 최대 시도 횟수
    const POLL_INTERVAL = 5000;
    const MAX_POLLS = 24; // 약 2분 (5s * 24)

    // 진행중(ANALYZING/GENERATING) 상태를 받은 feedbackId를 주기적으로 재조회
    const pollDetail = (feedbackId: number, attempt: number) => {
      pollTimer = setTimeout(async () => {
        if (!isMounted) return;
        try {
          const detail = await getFeedbackDetail(feedbackId);
          if (!isMounted) return;

          if (detail.status === "COMPLETED") {
            setStatusMessage(null);
            setFeedbackData(
              mapFeedbackResponse(detail as FeedbackDetailCompleted)
            );
          } else if (detail.status === "FAILED") {
            setStatusMessage(null);
            setErrorMessage(
              (detail as { message?: string }).message ||
                "피드백 분석에 실패했습니다. 잠시 후 다시 시도해주세요."
            );
          } else if (attempt + 1 >= MAX_POLLS) {
            // 시간 초과 - 그만 폴링하고 안내
            setStatusMessage(
              "분석이 예상보다 오래 걸리고 있어요. 잠시 후 페이지를 새로고침해 주세요."
            );
          } else {
            // 여전히 진행중 - 다음 폴링 예약
            pollDetail(feedbackId, attempt + 1);
          }
        } catch (error) {
          if (!isMounted) return;
          setErrorMessage(toFriendlyErrorMessage(error));
        }
      }, POLL_INTERVAL);
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
        } else if (detail.status === "FAILED") {
          setErrorMessage(
            (detail as { message?: string }).message ||
              "피드백 분석에 실패했습니다. 잠시 후 다시 시도해주세요."
          );
        } else {
          // ANALYZING, GENERATING 등 - 안내 메시지 + 주기적 재조회 시작
          setStatusMessage(
            (detail as { message?: string }).message ||
              "AI가 최근 연습 기록을 분석 중이에요. 잠시만 기다려 주세요."
          );
          pollDetail(created.feedbackId, 0);
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(toFriendlyErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, []);

  return (
    <div className="feedback-analysis-page">
      <PracticeHeader />

      <main className="feedback-analysis-page__main">
        {isLoading ? (
          <FeedbackSkeleton />
        ) : errorMessage ? (
          <FeedbackStateView
            tone="error"
            title="피드백을 불러오지 못했어요"
            description={errorMessage}
          />
        ) : statusMessage ? (
          <FeedbackStateView
            tone="info"
            title="AI가 피드백을 만들고 있어요"
            description={statusMessage}
          />
        ) : (
          <>
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

            <FeedbackBody
              feedbackData={feedbackData}
              displayName={displayName}
            />
          </>
        )}
      </main>

      <PracticeFooter />
    </div>
  );
}

type FeedbackStateViewProps = {
  tone: "info" | "error";
  title: string;
  description: string;
};

/**
 * 에러/분석중처럼 정상 데이터를 보여줄 수 없는 상태에서,
 * 빈 카드들 대신 화면 중앙에 한 장의 안내 카드만 노출한다.
 */
function FeedbackStateView({ tone, title, description }: FeedbackStateViewProps) {
  return (
    <div className={`feedback-state-view feedback-state-view--${tone}`}>
      <div className="feedback-state-view__icon" aria-hidden>
        {tone === "error" ? "⚠️" : "⏳"}
      </div>
      <h2 className="feedback-state-view__title">{title}</h2>
      <p className="feedback-state-view__description">{description}</p>
    </div>
  );
}

type FeedbackBodyProps = {
  feedbackData: FeedbackPageData;
  displayName: string;
};

function FeedbackBody({ feedbackData, displayName }: FeedbackBodyProps) {
  return (
    <>
      <section className="feedback-analysis-page__top-layout">
        <article className="feedback-analysis-page__style-card">
          <header className="feedback-analysis-page__style-head">
            <h2 className="feedback-analysis-page__style-title">
              내 발표 스타일
            </h2>
            <span className="feedback-analysis-page__style-legend">
              내 발표 정보
            </span>
          </header>

          <FeedbackStyleMatrix
            styleName={feedbackData.styleMatch?.styleName ?? null}
            wpm={feedbackData.averages.wpm.value}
            pitch={feedbackData.averages.pitch.value}
          />

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
            </div>

            <FeedbackTrendChart series={feedbackData.trendSeries} />
          </article>
        </div>
      </section>

      <section className="feedback-analysis-page__report-card">
        <h2 className="feedback-analysis-page__section-title">
          📝 AI 분석 리포트
        </h2>

        {feedbackData.analysisSections.length > 0 ? (
          <div className="feedback-report-sections">
            {feedbackData.analysisSections.map((section) => (
              <article
                key={section.kind}
                className={`feedback-report-section feedback-report-section--${section.kind}`}
              >
                <header className="feedback-report-section__head">
                  <span
                    className="feedback-report-section__icon"
                    aria-hidden
                  >
                    {section.icon}
                  </span>
                  <span className="feedback-report-section__heading">
                    {section.heading}
                  </span>
                  {section.title && (
                    <span className="feedback-report-section__title">
                      — {section.title}
                    </span>
                  )}
                </header>

                {section.description && (
                  <p className="feedback-report-section__description">
                    {section.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="feedback-analysis-page__empty-text">
            AI 분석 리포트가 아직 없습니다.
          </p>
        )}
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
    </>
  );
}