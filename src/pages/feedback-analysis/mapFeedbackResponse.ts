import type {
  FeedbackDetailCompleted,
  FeedbackTrendPoint,
} from "../../api/feedback";

type MetricStatus = "낮음" | "보통" | "높음" | null;

export type FeedbackTrendComparison = {
  label: string;
  unit: string;
  current: number | null;
  previous: number | null;
  diff: string | null;
};

// 그래프용 시계열 타입 (n회차 라벨 + 값)
export type FeedbackTrendSeries = {
  key: "speed" | "hz" | "db" | "pause" | "zcr";
  label: string;
  unit: string;
  points: { sessionLabel: string; date: string; value: number }[];
};

// AI 분석 리포트의 두 섹션(잘하고 있는 점 / 보완이 필요한 점)
export type FeedbackAnalysisSection = {
  kind: "positive" | "improvement";
  icon: string;     // ✅ or ⚠️
  heading: string;  // "잘하고 있는 점" / "보완이 필요한 점"
  title: string | null;        // 백엔드 positiveFeedback.title
  description: string | null;  // 백엔드 positiveFeedback.description (줄바꿈 보존)
};

function parseLeadingNumber(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isNaN(value) ? null : value;
}

// ───────────────────────────────────────────────
// 임계값 기반 상태/코멘트 (UI 보강용 - 백엔드에 없는 필드)
//
// 근거: SayUpAI 알고리즘 가이드 §6 Gold Standard, §7 Threshold Specs
//   WPM   : §7 글로벌 임계값  100 ~ 180
//   Pitch : §7 성인 발화 절대 범위 80 ~ 450 Hz (개인 Baseline 미수신 시 절대범위 사용)
//   dB    : §6, §7 (45 미만 / 80 초과 임계값, Gold Standard 63.72)
//   ZCR   : §6, §7 (0.04 미만 / 0.25 초과 임계값, Gold Standard 0.1108)
//           ※ 백엔드는 raw ZCR × 100 후 "76 %"처럼 보냄.
//             §6 raw 기준(0.04~0.25)에 ×100 하면 4~25%인데 실측 76%로 한참 벗어남.
//             백엔드 정규화 방식이 §6의 raw ZCR과 다를 가능성 → 별도 확인 필요.
//             현재 임계값은 백엔드 보내는 스케일(0~100) 기준 추정. 추후 합의 시 교체.
//   Pause : §7 휴지기 비율 8% ~ 25%
//           ※ 단, 백엔드 totalPauses는 "총 횟수"(예: "8 회")로 % 비율과 단위가 다름.
//             현재는 횟수 기준 임시 임계값 사용(자연스러운 발화 범위 추정).
//             백엔드가 pauseRatio(%)로 변경되면 8/25 적용 필요.
// ───────────────────────────────────────────────
type MetricKind = "wpm" | "hz" | "zcr" | "pause" | "db";

function classify(kind: MetricKind, value: number | null): MetricStatus {
  if (value === null) return null;
  switch (kind) {
    case "wpm":
      // §7: 100 미만 과소 / 180 초과 과속
      if (value < 100) return "낮음";
      if (value > 180) return "높음";
      return "보통";
    case "hz":
      // §7 정의: "Baseline 대비 ±20%" — 본래 개인 Baseline 기준 상대 비교가 정답.
      // 그러나 현재 응답에 baseline이 없어 부득이 절대값 기반 임시 분류 사용.
      // 가이드 §3 발표 스타일 평균 Pitch 분포(남성 125~190Hz, 여성 188~276Hz)를
      // 참고해 그 분포 범위(약 130~276Hz)를 "보통"으로 잡음.
      // ※ §7의 "80~450Hz"는 성인 음성의 물리적 한계이지 분류 임계값이 아님.
      //   해당 범위로 임계값을 잡으면 거의 모든 사용자가 "보통"으로 분류되어
      //   배지 분류가 무의미해지므로 사용하지 않음.
      // TODO: baseline 응답 추가되면 Baseline×0.8 / Baseline×1.2 로 교체
      if (value < 130) return "낮음";
      if (value > 276) return "높음";
      return "보통";
    case "zcr":
      // 백엔드 스케일(0~100) 기준 임시 임계값.
      // §6 raw 기준과 단위 정의가 어긋나 정확한 임계값은 백엔드 합의 후 교체 필요.
      if (value < 80) return "낮음";
      if (value > 95) return "높음";
      return "보통";
    case "pause":
      // 횟수 기준 임시 (TODO: pauseRatio %로 변경 시 8/25 임계값 사용)
      if (value < 3) return "낮음";
      if (value > 12) return "높음";
      return "보통";
    case "db":
      // §6, §7: 45 미만 음량 저하 / 80 초과 과도, Gold Standard 63.72
      if (value < 45) return "낮음";
      if (value > 80) return "높음";
      return "보통";
  }
}

function comment(kind: MetricKind, status: MetricStatus): string | null {
  if (!status) return null;
  const map: Record<MetricKind, Record<"낮음" | "보통" | "높음", string>> = {
    wpm: {
      낮음: "조금 느린 편이에요",
      보통: "적당한 속도에요",
      높음: "조금 빠른 편이에요",
    },
    hz: {
      낮음: "낮고 안정적이에요",
      보통: "자연스러운 톤이에요",
      높음: "톤이 높은 편이에요",
    },
    zcr: {
      낮음: "또렷함이 부족해요",
      보통: "또렷한 발음이에요",
      높음: "매우 또렷해요",
    },
    pause: {
      낮음: "쉼이 부족해요",
      보통: "자연스러운 편이에요",
      높음: "쉼이 잦은 편이에요",
    },
    db: {
      낮음: "조금 작은 편이에요",
      보통: "적당한 성량이에요",
      높음: "조금 큰 편이에요",
    },
  };
  return map[kind][status];
}

// ───────────────────────────────────────────────
// 시계열 → current/previous/diff 변환
// 마지막 값을 current, 그 직전 값을 previous로 사용
// ───────────────────────────────────────────────
function summarizeTrend(
  points: FeedbackTrendPoint[] | undefined | null,
  unit: string,
  decimals = 0
): { current: number | null; previous: number | null; diff: string | null } {
  if (!points || points.length === 0) {
    return { current: null, previous: null, diff: null };
  }
  // 날짜 오름차순 보장
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const current = sorted[sorted.length - 1]?.value ?? null;
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2].value : null;

  let diff: string | null = null;
  if (current !== null && previous !== null) {
    const d = current - previous;
    const sign = d > 0 ? "+ " : d < 0 ? "- " : "";
    const abs = Math.abs(d).toFixed(decimals);
    diff = `${sign}${abs}${unit}`;
  }
  return { current, previous, diff };
}

// 시계열을 그래프용 형식으로 변환 (n회차 라벨 부여)
function toSeries(
  key: FeedbackTrendSeries["key"],
  label: string,
  unit: string,
  points: FeedbackTrendPoint[] | undefined | null
): FeedbackTrendSeries {
  const sorted = points
    ? [...points].sort((a, b) => a.date.localeCompare(b.date))
    : [];
  return {
    key,
    label,
    unit,
    points: sorted.map((p, idx) => ({
      sessionLabel: `${idx + 1}회`,
      date: p.date,
      value: p.value,
    })),
  };
}

export function mapFeedbackResponse(response: FeedbackDetailCompleted) {
  const m = response.userAverageMetrics;
  const g = response.growthTrend;

  // 평균 지표 파싱 + 상태/코멘트 계산
  const wpmVal = parseLeadingNumber(m?.avgSpeed);
  const hzVal = parseLeadingNumber(m?.avgHz);
  const zcrVal = parseLeadingNumber(m?.avgZCR);
  const pauseVal = parseLeadingNumber(m?.totalPauses);
  const dbVal = parseLeadingNumber(m?.avgDB);

  const wpmStatus = classify("wpm", wpmVal);
  const hzStatus = classify("hz", hzVal);
  const zcrStatus = classify("zcr", zcrVal);
  const pauseStatus = classify("pause", pauseVal);
  const dbStatus = classify("db", dbVal);

  // 발음 명료도: 백엔드는 % 스케일(예: "88 %", "76 %")
  // UI 디자인은 ZCR 단위 + 0.xx 표기를 쓰므로, 화면 표시는 페이지에서 처리하도록 값만 그대로 전달

  // styleMatching이 객체로 오더라도 모든 필드가 null이면 "미연결"로 취급
  const sm = response.styleMatching;
  const hasStyle =
    !!sm &&
    (sm.mostSimilarStyle !== null ||
      sm.matchingRate !== null ||
      sm.description !== null);

  // aiReport도 마찬가지 - 모든 필드가 null이면 비활성
  const ar = response.aiReport;
  const hasPositive = !!ar?.positiveFeedback?.title || !!ar?.positiveFeedback?.description;
  const hasImprovement =
    !!ar?.improvementFeedback?.title || !!ar?.improvementFeedback?.description;

  // 페이지에서 두 섹션을 각각 카드로 렌더하기 위한 구조화된 데이터.
  // description은 줄바꿈을 보존해 전달하므로, AI가 본문에 1/2/3 등 구조를
  // 넣어 보내면 페이지에서 그대로 렌더 가능.
  const analysisSections: FeedbackAnalysisSection[] = [];
  if (hasPositive) {
    analysisSections.push({
      kind: "positive",
      icon: "✅",
      heading: "잘하고 있는 점",
      title: ar.positiveFeedback.title ?? null,
      description: ar.positiveFeedback.description ?? null,
    });
  }
  if (hasImprovement) {
    analysisSections.push({
      kind: "improvement",
      icon: "⚠️",
      heading: "보완이 필요한 점",
      title: ar.improvementFeedback.title ?? null,
      description: ar.improvementFeedback.description ?? null,
    });
  }

  return {
    기준라벨: `${response.startDate} ~ ${response.endDate}`,

    styleMatch: hasStyle
      ? {
          styleName: sm!.mostSimilarStyle,
          matchRate: sm!.matchingRate,
          headline: sm!.description,
          description: null,
        }
      : null,

    averages: {
      wpm: {
        value: wpmVal,
        unit: "wpm",
        status: wpmStatus,
        description: comment("wpm", wpmStatus),
      },
      pitch: {
        value: hzVal,
        unit: "Hz",
        status: hzStatus,
        description: comment("hz", hzStatus),
      },
      pronunciation: {
        value: zcrVal,
        unit: "%",
        status: zcrStatus,
        description: comment("zcr", zcrStatus),
        decimals: 0,
      },
      pauses: {
        value: pauseVal,
        unit: "회",
        status: pauseStatus,
        description: comment("pause", pauseStatus),
      },
      volume: {
        value: dbVal,
        unit: "dB",
        status: dbStatus,
        description: comment("db", dbStatus),
      },
    },

    // 평균 카드 옆에 표시되는 단순 비교 (마지막 vs 직전)
    trendComparisons: [
      { label: "발화 속도", ...summarizeTrend(g?.speed, "wpm", 0) },
      { label: "음성 에너지", ...summarizeTrend(g?.db, "dB", 0) },
      { label: "멈춤 구간", ...summarizeTrend(g?.pause, "회", 0) },
      { label: "발음 명료도", ...summarizeTrend(g?.zcr, "%", 0) },
      { label: "강조", ...summarizeTrend(g?.hz, "Hz", 0) },
    ].map((row, idx) => ({
      ...row,
      unit: ["wpm", "dB", "회", "%", "Hz"][idx],
    })) as FeedbackTrendComparison[],

    // 꺾은선 차트용 다중 시계열
    trendSeries: [
      toSeries("speed", "속도", "wpm", g?.speed),
      toSeries("hz", "피치", "Hz", g?.hz),
      toSeries("db", "성량", "dB", g?.db),
      toSeries("pause", "멈춤", "회", g?.pause),
      toSeries("zcr", "발음", "%", g?.zcr),
    ] as FeedbackTrendSeries[],

    analysisSections,

    summaryReport: [
      response.practiceGuide?.summary ?? "",
      response.practiceGuide?.nextStep ?? "",
      response.practiceGuide?.targetMetrics?.length
        ? `개선 대상 지표: ${response.practiceGuide.targetMetrics.join(", ")}`
        : "",
    ].filter(Boolean) as string[],
  };
}