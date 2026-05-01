import { api } from "./http";
import {
  saveAuthSession as persistAuthSession,
  type StoredUserInfo,
} from "./authStorage";
import type { ApiResponse } from "./response";
import { unwrapResponse } from "./response";

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
