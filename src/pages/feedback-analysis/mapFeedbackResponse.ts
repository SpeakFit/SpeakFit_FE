import type { FeedbackDetailCompleted } from "../../api/feedback";

type MetricStatus = "낮음" | "보통" | "높음" | null;

export type FeedbackTrendComparison = {
  label: string;
  unit: string;
  current: number | null;
  previous: number | null;
  diff: string | null;
};

function parseLeadingNumber(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isNaN(value) ? null : value;
}

export function mapFeedbackResponse(response: FeedbackDetailCompleted) {
  const m = response.userAverageMetrics;
  const g = response.growthTrend;

  return {
    기준라벨: `${response.startDate} ~ ${response.endDate}`,

    styleMatch: response.styleMatching
      ? {
          styleName: response.styleMatching.mostSimilarStyle,
          matchRate: response.styleMatching.matchingRate,
          headline: response.styleMatching.description,
          description: null,
        }
      : null,

    averages: {
      wpm: {
        value: parseLeadingNumber(m.avgSpeed),
        unit: "wpm",
        status: null as MetricStatus,
        description: null,
      },
      pitch: {
        value: parseLeadingNumber(m.avgHz),
        unit: "Hz",
        status: null as MetricStatus,
        description: null,
      },
      pronunciation: {
        value: parseLeadingNumber(m.avgZCR),
        unit: "%",
        status: null as MetricStatus,
        description: null,
        decimals: 0,
      },
      pauses: {
        value: parseLeadingNumber(m.totalPauses),
        unit: "회",
        status: null as MetricStatus,
        description: null,
      },
      volume: {
        value: parseLeadingNumber(m.avgDB),
        unit: "dB",
        status: null as MetricStatus,
        description: null,
      },
    },

    trendComparisons: [
      {
        label: "발화 속도",
        unit: "wpm",
        current: g.speed?.current ?? null,
        previous: g.speed?.previous ?? null,
        diff: g.speed?.diff ?? null,
      },
      {
        label: "음성 에너지",
        unit: "dB",
        current: g.db?.current ?? null,
        previous: g.db?.previous ?? null,
        diff: g.db?.diff ?? null,
      },
      {
        label: "멈춤 구간",
        unit: "회",
        current: g.pause?.current ?? null,
        previous: g.pause?.previous ?? null,
        diff: g.pause?.diff ?? null,
      },
      {
        label: "발음 명료도",
        unit: "%",
        current: g.zcr?.current ?? null,
        previous: g.zcr?.previous ?? null,
        diff: g.zcr?.diff ?? null,
      },
      {
        label: "강조",
        unit: "Hz",
        current: g.hz?.current ?? null,
        previous: g.hz?.previous ?? null,
        diff: g.hz?.diff ?? null,
      },
    ] as FeedbackTrendComparison[],

    analysisReport: [
      `✅ 잘하고 있는 점 — ${response.aiReport.positiveFeedback.title}`,
      response.aiReport.positiveFeedback.description,
      "",
      `⚠️ 보완이 필요한 점 — ${response.aiReport.improvementFeedback.title}`,
      response.aiReport.improvementFeedback.description,
    ].join("\n"),

    summaryReport: [
      response.practiceGuide.summary,
      response.practiceGuide.nextStep,
      response.practiceGuide.targetMetrics.length
        ? `개선 대상 지표: ${response.practiceGuide.targetMetrics.join(", ")}`
        : "",
    ].filter(Boolean) as string[],
  };
}
