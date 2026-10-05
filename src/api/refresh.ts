import axios from "axios";
import { updateStoredAccessToken } from "./authStorage";
import { unwrapResponse, type ApiResponse } from "./response";

// 인터셉터가 걸린 api 인스턴스를 쓰면 재발급 요청이 다시 인터셉터를 타므로 별도 인스턴스를 사용한다.
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 리프레시 토큰은 HttpOnly 쿠키로 전달된다.
  headers: {
    Accept: "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

async function requestNewAccessToken() {
  const { data } = await refreshClient.post<ApiResponse<{ accessToken: string }>>(
    "/auth/refresh",
  );
  const { accessToken } = unwrapResponse(data, "토큰 재발급에 실패했습니다.");

  updateStoredAccessToken(accessToken);

  return accessToken;
}

/**
 * access 토큰을 재발급한다.
 * 서버는 refresh 토큰을 1회용(회전)으로 취급하므로, 동시에 여러 요청이 401 을 받아도
 * 재발급 요청은 하나만 보내고 결과를 공유해야 한다. (중복 요청 시 서버가 탈취로 판단해 세션을 끊는다)
 */
export function refreshAccessToken() {
  refreshPromise ??= requestNewAccessToken().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
