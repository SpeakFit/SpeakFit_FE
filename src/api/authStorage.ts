export const ACCESS_TOKEN_KEY = "speakfit_access_token";
export const USER_KEY = "speakfit_user";

export type StoredUserInfo = {
  userId: number;
  email: string;
  nickname: string;
  birthday?: string;
  gender?: string;
  dialect?: string;
  voiceOnboardingRequired?: boolean;
  defaultPitch?: number | null;
  defaultWpm?: number | null;
  defaultVoice?: {
    defaultPitch?: number | null;
    defaultWpm?: number | null;
  } | null;
};

const getStoragePair = () => [localStorage, sessionStorage] as const;

function decodeJwtPayload(token: string) {
  const payload = token.split(".")[1];

  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "="
    );
    const decodedPayload = atob(paddedPayload);

    return JSON.parse(decodedPayload) as { exp?: number };
  } catch {
    return null;
  }
}

export function isExpiredToken(token: string) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) return false;

  return payload.exp * 1000 <= Date.now();
}

// 만료된 토큰도 그대로 반환한다.
// 만료 처리는 api/http.ts 의 인터셉터가 담당한다. (리프레시 토큰으로 재발급, 실패하면 세션 종료)
export function getStoredAccessToken() {
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ??
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
}

export function getStoredUser() {
  if (!getStoredAccessToken()) return null;

  const userJson =
    localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);

  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as StoredUserInfo;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function saveAuthSession(
  accessToken: string,
  user: StoredUserInfo,
  keepLogin: boolean
) {
  const storage = keepLogin ? localStorage : sessionStorage;
  const otherStorage = keepLogin ? sessionStorage : localStorage;

  otherStorage.removeItem(ACCESS_TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);

  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

// 재발급받은 access 토큰으로 교체한다. (기존에 토큰이 저장된 저장소를 그대로 사용 -> 로그인 유지 설정 보존)
export function updateStoredAccessToken(accessToken: string) {
  const storage = localStorage.getItem(ACCESS_TOKEN_KEY)
    ? localStorage
    : sessionStorage;

  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function updateStoredUser(user: StoredUserInfo) {
  const storage = localStorage.getItem(USER_KEY) ? localStorage : sessionStorage;

  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  getStoragePair().forEach((storage) => {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(USER_KEY);
  });
}
