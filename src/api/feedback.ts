import { api } from "./http";
import type { ApiResponse } from "./response";
import { unwrapResponse } from "./response";

// ─────────────────────────────
// 1) 피드백 생성
// ─────────────────────────────
export type CreateFeedbackRequest = {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
};

export type CreateFeedbackResponse = {
  feedbackId: number;
  status: "GENERATING" | "ANALYZING" | "COMPLETED" | string;
  message: string;
};

export async function createFeedback(payload: CreateFeedbackRequest) {
  const { data } = await api.post<ApiResponse<CreateFeedbackResponse>>(
    "/api/feedbacks",
    payload
  );
  return unwrapResponse(data, "피드백 생성에 실패했습니다.");
}

// ─────────────────────────────
// 2) 피드백 상세 조회 (V2)
// ─────────────────────────────
export type FeedbackUserAverageMetrics = {
  avgSpeed: string;     // "125 wpm"
  avgDB: string;        // "75 dB"
  totalPauses: string;  // "8 회"
  avgZCR: string;       // "88 %"
  avgHz: string;        // "130 Hz"
};

export type FeedbackStyleMatching = {
  mostSimilarStyle: string;
  matchingRate: number;
  description: string;
};

export type FeedbackGrowthTrendItem = {
  current: number;
  previous: number;
  diff: string; // "+ 15wpm"
};

export type FeedbackGrowthTrend = {
  speed: FeedbackGrowthTrendItem;
  db: FeedbackGrowthTrendItem;
  pause: FeedbackGrowthTrendItem;
  zcr: FeedbackGrowthTrendItem;
  hz: FeedbackGrowthTrendItem;
};

export type FeedbackAiReport = {
  positiveFeedback: {
    title: string;
    description: string;
  };
  improvementFeedback: {
    title: string;
    description: string;
  };
};

export type FeedbackPracticeGuide = {
  targetMetrics: string[];
  summary: string;
  nextStep: string;
};

export type FeedbackDetailAnalyzing = {
  id: number;
  status: "ANALYZING";
  message: string;
};

export type FeedbackDetailCompleted = {
  id: number;
  status: "COMPLETED";
  startDate: string;
  endDate: string;
  userAverageMetrics: FeedbackUserAverageMetrics;
  styleMatching: FeedbackStyleMatching;
  growthTrend: FeedbackGrowthTrend;
  aiReport: FeedbackAiReport;
  practiceGuide: FeedbackPracticeGuide;
};

export type FeedbackDetailResponse =
  | FeedbackDetailAnalyzing
  | FeedbackDetailCompleted;

export async function getFeedbackDetail(feedbackId: number) {
  const { data } = await api.get<ApiResponse<FeedbackDetailResponse>>(
    `/api/feedbacks/${feedbackId}`
  );
  return unwrapResponse(data, "피드백 상세를 불러오지 못했습니다.");
}
