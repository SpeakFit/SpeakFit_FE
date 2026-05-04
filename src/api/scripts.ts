import { api } from "./http";
import type { ApiResponse } from "./response";
import { unwrapResponse } from "./response";

export type AudienceAgeCode = "SENIOR" | "ADULT" | "YOUTH" | "CHILD";
export type AudienceLevelCode = "LOW" | "MIDDLE" | "HIGH";
export type SpeechTypeCode =
  | "PRESENTATION"
  | "INTERVIEW"
  | "LECTURE"
  | "DISCUSSION"
  | "FEEDBACKPRACTICE";

export type ScriptResponse = {
  id: number;
  title: string;
  content: string;
  markedContent?: string;
  marked_content?: string;
  createdAt?: string;
};

export type GeneratedScriptResponse = {
  generatedScript?: string;
  content?: string;
  updatedScript?: string;
  optimizedScript?: string;
};

export type AddScriptRequest = {
  title: string;
  content: string;
};

export type GenerateScriptRequest = {
  topic: string;
  time: number;
  audienceAge: AudienceAgeCode;
  audienceLevel: AudienceLevelCode;
  speechType: SpeechTypeCode;
  purpose: string;
  keywords: string;
};

export type UpdateScriptRequest = GenerateScriptRequest & {
  content: string;
};

export type PatchScriptRequest = {
  title: string;
  content: string;
};

export type PatchScriptResponse = {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
};

export type InputPracticeInfoRequest = {
  audienceType: AudienceAgeCode;
  audienceUnderstanding: AudienceLevelCode;
  speechInformation: SpeechTypeCode;
  targetTime: number;
};

export async function getScripts() {
  const { data } = await api.get<ApiResponse<ScriptResponse[]>>("/api/scripts");

  return unwrapResponse(data, "대본 목록을 불러오지 못했습니다.");
}

export async function getScript(scriptId: number) {
  const { data } = await api.get<ApiResponse<ScriptResponse>>(
    `/api/scripts/${scriptId}`,
  );

  return unwrapResponse(data, "대본 상세 정보를 불러오지 못했습니다.");
}

export async function addScript(payload: AddScriptRequest) {
  const { data } = await api.post<ApiResponse<ScriptResponse>>("/api/scripts", payload);

  return unwrapResponse(data, "대본 저장에 실패했습니다.");
}

export async function deleteScript(scriptId: number) {
  const { data } = await api.delete<ApiResponse<ScriptResponse>>(`/api/scripts/${scriptId}`);

  return unwrapResponse(data, "대본 삭제에 실패했습니다.");
}

export async function generateScript(payload: GenerateScriptRequest) {
  const { data } = await api.post<ApiResponse<GeneratedScriptResponse>>(
    "/api/scripts/ai-generate",
    payload
  );

  return unwrapResponse(data, "스크립트 생성에 실패했습니다.");
}

export async function updateScript(payload: UpdateScriptRequest) {
  const { data } = await api.post<ApiResponse<GeneratedScriptResponse>>(
    "/api/scripts/ai-update",
    payload
  );

  return unwrapResponse(data, "스크립트 최적화에 실패했습니다.");
}

export async function patchScript(scriptId: number, payload: PatchScriptRequest) {
  const { data } = await api.patch<ApiResponse<PatchScriptResponse>>(
    `/api/scripts/${scriptId}`,
    payload
  );

  return unwrapResponse(data, "대본 수정에 실패했습니다.");
}

export async function inputPracticeInfo(
  scriptId: number,
  payload: InputPracticeInfoRequest
) {
  const { data } = await api.post<ApiResponse<ScriptResponse>>(
    `/api/scripts/${scriptId}`,
    payload
  );

  return unwrapResponse(data, "발표 연습 정보를 저장하지 못했습니다.");
}
