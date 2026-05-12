import { api } from "./http";
import {
  clearAuthSession as clearStoredAuthSession,
  getStoredUser as getStoredAuthUser,
  saveAuthSession as persistAuthSession,
  type StoredUserInfo,
} from "./authStorage";
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

export function saveAuthSession(auth: LoginResponse, keepLogin: boolean) {
  persistAuthSession(auth.accessToken, auth.user, keepLogin);
}

export function getStoredUser(): StoredUserInfo | null {
  return getStoredAuthUser();
}

export function clearAuthSession() {
  clearStoredAuthSession();
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
