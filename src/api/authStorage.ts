export const ACCESS_TOKEN_KEY = "sayupai_access_token";
export const USER_KEY = "sayupai_user";

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

function isExpiredToken(token: string) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) return false;

  return payload.exp * 1000 <= Date.now();
}

export function getStoredAccessToken() {
  const token =
    localStorage.getItem(ACCESS_TOKEN_KEY) ??
    sessionStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) return null;

  if (isExpiredToken(token)) {
    clearAuthSession();
    return null;
  }

  return token;
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
