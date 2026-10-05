import { api } from "./http";
import {
  clearAuthSession as clearStoredAuthSession,
  getStoredUser as getStoredAuthUser,
  saveAuthSession as persistAuthSession,
  updateStoredUser,
  type StoredUserInfo,
} from "./authStorage";
import type { UploadVoiceProfileResponse } from "./voice";
import type { ApiResponse } from "./response";
import { unwrapResponse } from "./response";

const VOICE_ONBOARDING_SEEN_KEY_PREFIX = "speakfit_voice_onboarding_seen";

export type SignUpRequest = {
  email: string;
  birthday: string;
  password: string;
  nickname: string;
  gender: "MALE" | "FEMALE";
  dialect: "STANDARD" | "GYEONGSANG" | "CHUNGCHEONG" | "JEOLLA" | "GANGWON";
  terms: Array<{
    termId: number;
    agreed: boolean;
  }>;
};

type SignUpResponse = {
  userId: number;
  email: string;
  nickname: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: StoredUserInfo;
};

export async function signUp(payload: SignUpRequest) {
  const { data } = await api.post<ApiResponse<SignUpResponse>>(
    "/auth/signup",
    payload
  );

  return unwrapResponse(data, "회원가입에 실패했습니다.");
}

export async function login(payload: LoginRequest) {
  const { data } = await api.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    payload
  );

  return unwrapResponse(data, "로그인에 실패했습니다.");
}

export function getStoredUser(): StoredUserInfo | null {
  return getStoredAuthUser();
}

function isValidVoiceMetric(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function hasDefaultVoice(user: StoredUserInfo | null) {
  if (!user) {
    return false;
  }

  return (
    isValidVoiceMetric(user.defaultVoice?.defaultPitch) &&
    isValidVoiceMetric(user.defaultVoice?.defaultWpm)
  ) || isValidVoiceMetric(user.defaultPitch) || isValidVoiceMetric(user.defaultWpm);
}

export function needsVoiceOnboarding(user: StoredUserInfo | null) {
  return !hasDefaultVoice(user);
}

function withVoiceOnboardingStatus(user: StoredUserInfo): StoredUserInfo {
  return {
    ...user,
    voiceOnboardingRequired: needsVoiceOnboarding(user),
  };
}

// 로그인한 사용자가 음색 분석(기본 음색 등록)을 아직 하지 않았는지 여부
export function isVoiceOnboardingRequired(user: StoredUserInfo | null) {
  if (!user) {
    return false;
  }

  return user.voiceOnboardingRequired ?? needsVoiceOnboarding(user);
}

export function saveAuthSession(auth: LoginResponse, keepLogin: boolean) {
  persistAuthSession(
    auth.accessToken,
    withVoiceOnboardingStatus(auth.user),
    keepLogin
  );
}

export function saveVoiceOnboardingResult(result: UploadVoiceProfileResponse) {
  const user = getStoredUser();
  const defaultPitch = result.userAverageMetrics?.avgPitch;
  const defaultWpm = result.userAverageMetrics?.avgWPM;

  if (!user || !isValidVoiceMetric(defaultPitch) || !isValidVoiceMetric(defaultWpm)) {
    return;
  }

  updateStoredUser({
    ...user,
    voiceOnboardingRequired: false,
    defaultVoice: {
      ...user.defaultVoice,
      defaultPitch,
      defaultWpm,
    },
  });
}

export function clearAuthSession() {
  clearStoredAuthSession();
}

// 서버의 리프레시 토큰(쿠키 포함)을 폐기한다. 서버 응답과 무관하게 클라이언트 세션은 항상 종료한다.
export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // 이미 만료되었거나 네트워크 오류여도 로그아웃은 계속 진행한다.
  } finally {
    clearStoredAuthSession();
  }
}

function getVoiceOnboardingSeenKey(userId: number) {
  return `${VOICE_ONBOARDING_SEEN_KEY_PREFIX}_${userId}`;
}

export function hasSeenVoiceOnboarding() {
  const user = getStoredUser();

  if (!user) {
    return false;
  }

  return localStorage.getItem(getVoiceOnboardingSeenKey(user.userId)) === "true";
}

export function markVoiceOnboardingSeen() {
  const user = getStoredUser();

  if (!user) {
    return;
  }

  localStorage.setItem(getVoiceOnboardingSeenKey(user.userId), "true");
}

// 음성 녹음 화면에서 "나중에 하기"를 눌러 연습 화면으로 돌아왔을 때,
// 안내 모달이 곧바로 다시 뜨지 않도록 하는 1회성 표시 (탭을 닫으면 사라진다)
const VOICE_PROMPT_SKIPPED_KEY = "speakfit_voice_prompt_skipped";

export function markVoicePromptSkipped() {
  sessionStorage.setItem(VOICE_PROMPT_SKIPPED_KEY, "true");
}

export function hasSkippedVoicePrompt() {
  return sessionStorage.getItem(VOICE_PROMPT_SKIPPED_KEY) === "true";
}

export function clearVoicePromptSkipped() {
  sessionStorage.removeItem(VOICE_PROMPT_SKIPPED_KEY);
}
