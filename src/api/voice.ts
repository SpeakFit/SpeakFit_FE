import { api } from "./http";

export type UploadVoiceProfileResponse = {
  success: boolean;
  analysisId?: string;
  status?: "queued" | "processing" | "completed";
  isMock?: boolean;
};

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));  // window.setTimeout → setTimeout

export async function uploadVoiceProfileRecording(audioBlob: Blob) {
  const endpoint = import.meta.env.VITE_VOICE_PROFILE_ENDPOINT?.trim();
  const isMockAllowed =
    import.meta.env.DEV || import.meta.env.MODE === "test";

  if (!endpoint) {
    const message = "VITE_VOICE_PROFILE_ENDPOINT가 설정되지 않았습니다.";

    if (isMockAllowed) {
      await sleep(1400);

      return {
        success: true,
        analysisId: `mock-${Date.now()}`,
        status: "completed",
        isMock: true,
      } satisfies UploadVoiceProfileResponse;
    }

    console.error(message);
    throw new Error(message);
  }

  const extension = audioBlob.type.includes("mp4") ? "m4a" : "webm";
  const file = new File([audioBlob], `voice-profile.${extension}`, {
    type: audioBlob.type || "audio/webm",
  });

  const formData = new FormData();
  formData.append("voiceFile", file);  // ← 필드명 변경

  // Content-Type 헤더 제거: axios가 자동으로 boundary 포함해서 설정함
  const { data } = await api.post<UploadVoiceProfileResponse>(endpoint, formData);

  if (!data.success) {
    throw new Error("음성 분석 요청에 실패했습니다.");
  }

  return data;
}
