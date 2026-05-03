import { api } from "./http";

export type UploadVoiceProfileResponse = {
  success: boolean;
  analysisId?: string;
  status?: "queued" | "processing" | "completed";
  isMock?: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function uploadVoiceProfileRecording(audioBlob: Blob) {
  const endpoint = import.meta.env.VITE_VOICE_PROFILE_ENDPOINT;

  if (!endpoint) {
    await sleep(1400);
    return {
      success: true,
      analysisId: `mock-${Date.now()}`,
      status: "completed",
      isMock: true,
    } satisfies UploadVoiceProfileResponse;
  }

  const extension = audioBlob.type.includes("mp4") ? "m4a" : "webm";
  const file = new File([audioBlob], `voice-profile.${extension}`, {
    type: audioBlob.type || "audio/webm",
  });

  const formData = new FormData();
  formData.append("audio", file);

  const { data } = await api.post<UploadVoiceProfileResponse>(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!data.success) {
    throw new Error("음성 분석 요청에 실패했습니다.");
  }

  return data;
}
