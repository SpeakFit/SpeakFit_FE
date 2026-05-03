export type ApiResponse<T> = {
  code?: string;
  message?: string;
  result?: T;
  success?: boolean;
  isSuccess?: boolean;
};

export function unwrapResponse<T>(
  response: ApiResponse<T>,
  fallbackMessage: string,
) {
  const isSuccess = response.success ?? response.isSuccess;

  if (!isSuccess || response.result === undefined || response.result === null) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.result;
}
