import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ROUTES } from "../app/routes.const";
import {
  clearAuthSession,
  getStoredAccessToken,
  isExpiredToken,
} from "./authStorage";
import { refreshAccessToken } from "./refresh";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// 토큰 재발급 대상에서 제외하는 인증 API (로그인 실패 401 등을 재발급으로 처리하면 안 된다)
const AUTH_PATHS = ["/auth/login", "/auth/signup", "/auth/refresh", "/auth/logout"];

function isAuthRequest(url?: string) {
  return AUTH_PATHS.some((path) => url?.includes(path));
}

// 재발급까지 실패하면 로그인 상태를 정리하고 로그인 화면으로 보낸다.
function expireSession() {
  clearAuthSession();

  if (window.location.pathname !== ROUTES.LOGIN) {
    window.location.replace(ROUTES.LOGIN);
  }
}

api.interceptors.request.use(async (config) => {
  let accessToken = getStoredAccessToken();

  // 이미 만료된 토큰이면 401 왕복 없이 미리 재발급한다.
  if (accessToken && isExpiredToken(accessToken) && !isAuthRequest(config.url)) {
    try {
      accessToken = await refreshAccessToken();
    } catch {
      expireSession();
      accessToken = null;
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as RetriableRequestConfig | undefined;

  const shouldRefresh =
    error.response?.status === 401 &&
    original !== undefined &&
    !original._retry &&
    !isAuthRequest(original.url) &&
    getStoredAccessToken() !== null; // 로그인 상태가 아니면 재발급을 시도하지 않는다.

  if (!shouldRefresh) {
    return Promise.reject(error);
  }

  original._retry = true;

  try {
    const accessToken = await refreshAccessToken();
    original.headers.Authorization = `Bearer ${accessToken}`;

    return api(original);
  } catch {
    expireSession();

    return Promise.reject(error);
  }
});
