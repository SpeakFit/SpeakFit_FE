import { api } from "./http";

export const ACCESS_TOKEN_KEY = "speakfit_access_token";
const USER_KEY = "speakfit_user";

type ApiResponse<T> = {
  code?: string;
  message?: string;
  result?: T;
  success: boolean;
};

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

type UserInfo = {
  userId: number;
  email: string;
  nickname: string;
  birthday: string;
  gender: string;
  dialect: string;
};

type LoginResponse = {
  accessToken: string;
  user: UserInfo;
};

function unwrapResponse<T>(response: ApiResponse<T>, fallbackMessage: string) {
  if (!response.success || !response.result) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.result;
}

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
  const storage = keepLogin ? localStorage : sessionStorage;
  const otherStorage = keepLogin ? sessionStorage : localStorage;

  otherStorage.removeItem(ACCESS_TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);

  storage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  storage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function getStoredUser(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserInfo;
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

const VOICE_ONBOARDING_SEEN_KEY_PREFIX = "speakfit_voice_onboarding_seen";

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
