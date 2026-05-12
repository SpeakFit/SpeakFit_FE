import { api } from "./http";
import type { ApiResponse } from "./response";
import { unwrapResponse } from "./response";

export type VoiceStatus = "COMPLETED" | "PROCESSING" | "FAILED";

export type UploadVoiceProfileResponse = {
  analysisId: number;
  status: VoiceStatus;
  progress?: number;
  voiceStyle?: {
    mostSimilarStyle?: string;
    matchingRate?: number;
    description?: string;
  };
  userAverageMetrics?: {
    avgPitch?: number;
    avgWPM?: number;
  };
};

export async function uploadVoiceProfileRecording(audioBlob: Blob) {
  const extension = audioBlob.type.includes("mp4") ? "m4a" : "webm";
  const file = new File([audioBlob], `voice-profile.${extension}`, {
    type: audioBlob.type || "audio/webm",
  });

  const formData = new FormData();
  formData.append("voiceFile", file);

  const { data } = await api.post<ApiResponse<UploadVoiceProfileResponse>>(
    "/api/voice-analysis",
    formData,
  );

  return unwrapResponse(data, "음성 분석 요청에 실패했습니다.");
}
