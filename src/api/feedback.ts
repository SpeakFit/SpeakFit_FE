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
  status: "GENERATING" | "ANALYZING" | "COMPLETED" | "FAILED" | string;
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
  mostSimilarStyle: string | null;
  matchingRate: number | null;
  description: string | null;
};

// 백엔드 실제 응답: 각 지표가 [{date, value}, ...] 시계열 배열
export type FeedbackTrendPoint = {
  date: string;  // "2026-05-22"
  value: number;
};

export type FeedbackGrowthTrend = {
  speed: FeedbackTrendPoint[];
  db: FeedbackTrendPoint[];
  pause: FeedbackTrendPoint[];
  zcr: FeedbackTrendPoint[];
  hz: FeedbackTrendPoint[];
};

// 실제 응답에서 title/description이 null로 올 수 있음
export type FeedbackAiReport = {
  positiveFeedback: {
    title: string | null;
    description: string | null;
  };
  improvementFeedback: {
    title: string | null;
    description: string | null;
  };
};

export type FeedbackPracticeGuide = {
  targetMetrics: string[];
  summary: string;
  nextStep: string;
};

export type FeedbackDetailPending = {
  id: number;
  status: "ANALYZING" | "GENERATING" | "FAILED";
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
  | FeedbackDetailPending
  | FeedbackDetailCompleted;

export async function getFeedbackDetail(feedbackId: number) {
  const { data } = await api.get<ApiResponse<FeedbackDetailResponse>>(
    `/api/feedbacks/${feedbackId}`
  );
  return unwrapResponse(data, "피드백 상세를 불러오지 못했습니다.");
}