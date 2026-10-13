import { api } from "./http";
import type { ApiResponse } from "./response";
import { unwrapResponse } from "./response";

export type TermDetailResponse = {
  termId: number;
  title: string;
  content: string;
};

export async function getTermDetail(termId: number) {
  const { data } = await api.get<ApiResponse<TermDetailResponse>>(
    `/api/terms/${termId}`
  );

  return unwrapResponse(data, "약관 내용을 불러오지 못했습니다.");
}
