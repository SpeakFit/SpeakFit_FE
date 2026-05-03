import { api } from "./http";
import type { ApiResponse } from "./response";
import { unwrapResponse } from "./response";

export type AudienceType = "SENIOR" | "ADULT" | "YOUTH" | "CHILD";
export type AudienceUnderstanding = "LOW" | "MIDDLE" | "HIGH";
export type SpeechInformation =
  | "PRESENTATION"
  | "INTERVIEW"
  | "LECTURE"
  | "DISCUSSION"
  | "FEEDBACKPRACTICE";
export type StyleType =
  | "CALM_LOW_TONE"
  | "STANDARD_LECTURE"
  | "ENERGETIC_FAST"
  | "DELIVERY";

export type ScriptResponse = {
  id: number;
  title: string;
  content: string;
  contentList?: Array<{
    index: number;
    word: string;
    hasBreak: boolean;
    isEmphasis: boolean;
  }>;
  createdAt?: string;
};

export type AddScriptRequest = {
  title: string;
  content: string;
};

export type InputPracticeInfoRequest = {
  audienceType: AudienceType;
  audienceUnderstanding: AudienceUnderstanding;
  speechInformation: SpeechInformation;
  targetTime: number;
};

export type SpeechStyle = {
  styleId: number;
  styleType?: StyleType;
  description: string;
  guideAudioUrl?: string;
  sampleAudioUrl?: string;
  isRecommended?: boolean;
};

type SpeechStylesResponse = {
  styles?: SpeechStyle[];
};

export type InputPracticeInfoResponse = {
  practiceId: number;
  styleList: SpeechStyle[];
};

export type PracticeContent = {
  index: number;
  word: string;
  hasBreak: boolean;
  emphasis?: boolean;
  isEmphasis?: boolean;
};

export type WordRes = {
  scriptWordId: number;
  scriptSentenceId: number;
  sentenceIndex: number;
  globalWordIndex: number;
  sentenceWordIndex: number;
  text: string;
  normalizedText: string;
  startCharIndex: number;
  endCharIndex: number;
};

export type SentenceRes = {
  scriptSentenceId: number;
  sentenceIndex: number;
  originalText: string;
  normalizedText: string;
  startCharIndex: number;
  endCharIndex: number;
  words: WordRes[];
};

export type SelectPracticeStyleResponse = {
  practiceId: number;
  styleType: StyleType;
  contentList: PracticeContent[];
};

export type StartPracticeResponse = {
  practiceId: number;
  title: string;
  webSocketUrl?: string;
  status: string;
  contentList: PracticeContent[];
  sentences: SentenceRes[];
  scriptWords: WordRes[];
  createdAt?: string;
};

export type StopPracticeResponse = {
  practiceId: number;
  status: "ANALYZING" | "ANALYZED" | string;
  audioUrl: string;
};

export type PracticeAnalysisResult = {
  wpm?: {
    avg?: number;
    diff?: number;
  };
  pitch?: {
    avg?: number;
    diff?: number;
  };
  intensity?: {
    avg?: number;
    diff?: number;
  };
  zcr?: {
    avg?: number;
    diff?: number;
  };
  pause?: {
    ratio?: number;
    count?: number;
  };
};

export type PracticeAiAnalysisResult = {
  aiSummary?: string;
  wpmSummary?: string;
  wpmFeedback?: string;
  energySummary?: string;
  energyFeedback?: string;
  pauseFeedback?: string;
  symbolFeedback?: string;
  goalSimilarityScore?: number;
  goalSummary?: string;
  goalFeedback?: string;
};

export type PracticeIssueResponse = {
  startIndex?: number;
  endIndex?: number;
  issueSummary?: string;
  feedbackContent?: string;
  wpm?: number;
  intensity?: number;
};

export type PracticeSentenceResponse = {
  index: number;
  text?: string;
  originalText?: string;
  startTime?: number;
  endTime?: number;
  status?: string;
};

export type PracticeReportResponse = {
  practiceId: number;
  audioUrl?: string;
  time?: number;
  status?: string;
  audienceType?: AudienceType;
  audienceUnderstanding?: AudienceUnderstanding;
  speechInformation?: SpeechInformation;
  analysis?: PracticeAnalysisResult;
  aiAnalysis?: PracticeAiAnalysisResult;
  practiceIssues?: PracticeIssueResponse[];
  sentences?: PracticeSentenceResponse[];
};

const AUDIO_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/webm": "webm",
};

function getAudioFileName(audio: Blob) {
  const mimeType = audio.type.split(";")[0]?.toLowerCase();
  const extension = mimeType
    ? AUDIO_EXTENSION_BY_MIME_TYPE[mimeType] ?? "webm"
    : "webm";

  return `practice-recording.${extension}`;
}

export async function addScript(payload: AddScriptRequest) {
  const { data } = await api.post<ApiResponse<ScriptResponse>>(
    "/api/scripts",
    payload,
  );

  return unwrapResponse(data, "대본 저장에 실패했습니다.");
}

export async function inputPracticeInfo(
  scriptId: number,
  payload: InputPracticeInfoRequest,
) {
  const { data } = await api.post<ApiResponse<InputPracticeInfoResponse>>(
    `/api/scripts/${scriptId}`,
    payload,
  );

  return unwrapResponse(data, "연습 정보 저장에 실패했습니다.");
}

export async function getSpeechStyles() {
  const { data } = await api.get<ApiResponse<SpeechStylesResponse>>(
    "/api/styles",
  );

  return unwrapResponse(data, "스피치 스타일을 불러오지 못했습니다.").styles ?? [];
}

export async function selectPracticeStyle(practiceId: number, styleId: number) {
  const { data } = await api.post<ApiResponse<SelectPracticeStyleResponse>>(
    `/api/practices/${practiceId}/select-style`,
    { styleId },
  );

  return unwrapResponse(data, "스피치 스타일 선택에 실패했습니다.");
}

export async function startPractice(practiceId: number) {
  const { data } = await api.post<ApiResponse<StartPracticeResponse>>(
    `/api/practices/${practiceId}`,
  );

  return unwrapResponse(data, "연습 시작 요청에 실패했습니다.");
}

export async function stopPractice(
  practiceId: number,
  audio: Blob,
  time: number,
) {
  const formData = new FormData();
  formData.append("audio", audio, getAudioFileName(audio));
  formData.append("time", String(time));

  const { data } = await api.post<ApiResponse<StopPracticeResponse>>(
    `/api/practices/${practiceId}/stop`,
    formData,
  );

  return unwrapResponse(data, "연습 종료 요청에 실패했습니다.");
}

export async function getPracticeReport(practiceId: number) {
  const { data } = await api.get<ApiResponse<PracticeReportResponse>>(
    `/api/practices/${practiceId}/report`,
  );

  return unwrapResponse(data, "분석 리포트를 불러오지 못했습니다.");
}
