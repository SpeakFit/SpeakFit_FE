import { api } from "./http";
import {
  saveAuthSession as persistAuthSession,
  type StoredUserInfo,
} from "./authStorage";
import type { ApiResponse } from "./response";
import { unwrapResponse } from "./response";

const ACCESS_TOKEN_KEY = "speakfit_access_token";
const USER_KEY = "speakfit_user";
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

type LoginResponse = {
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
  const raw =
    localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUserInfo;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function getVoiceOnboardingSeenKey(userId: number) {
  return `${VOICE_ONBOARDING_SEEN_KEY_PREFIX}_${userId}`;
}

export function hasSeenVoiceOnboarding() {
  const user = getStoredUser();

  if (!user) {
    return false;
  }

  return (
    localStorage.getItem(getVoiceOnboardingSeenKey(user.userId)) === "true"
  );
}

export function markVoiceOnboardingSeen() {
  const user = getStoredUser();

  if (!user) {
    return;
  }

  localStorage.setItem(getVoiceOnboardingSeenKey(user.userId), "true");
}
