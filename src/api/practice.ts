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
  description: string;
  sampleAudioUrl?: string;
};

type SpeechStylesResponse = {
  styles?: SpeechStyle[];
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
  const { data } = await api.post<ApiResponse<ScriptResponse>>(
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
  const { data } = await api.post<ApiResponse<ScriptResponse>>(
    `/api/practices/${practiceId}/select-style`,
    { styleId },
  );

  return unwrapResponse(data, "스피치 스타일 선택에 실패했습니다.");
}

export async function startPractice(practiceId: number) {
  const { data } = await api.post<ApiResponse<ScriptResponse>>(
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

  const { data } = await api.post<ApiResponse<ScriptResponse>>(
    `/api/practices/${practiceId}/stop`,
    formData,
  );

  return unwrapResponse(data, "연습 종료 요청에 실패했습니다.");
}
