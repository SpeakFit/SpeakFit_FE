import { api } from "./http";

type ApiResponse<T> = {
  code?: string;
  message?: string;
  result?: T;
  success: boolean;
};

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

export type InputPracticeInfoRequest = {
  audienceType: AudienceAgeCode;
  audienceUnderstanding: AudienceLevelCode;
  speechInformation: SpeechTypeCode;
  targetTime: number;
};

function unwrapResponse<T>(response: ApiResponse<T>, fallbackMessage: string) {
  if (!response.success || !response.result) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.result;
}

export async function getScripts() {
  const { data } = await api.get<ApiResponse<ScriptResponse[]>>("/api/scripts");

  return unwrapResponse(data, "대본 목록을 불러오지 못했습니다.");
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
