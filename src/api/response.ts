export type ApiResponse<T> = {
  code?: string;
  message?: string;
  result?: T;
  success: boolean;
};

export function unwrapResponse<T>(
  response: ApiResponse<T>,
  fallbackMessage: string,
) {
  if (!response.success || response.result === undefined || response.result === null) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.result;
}
